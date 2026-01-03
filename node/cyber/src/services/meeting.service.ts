import { db } from '../config/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import type { MeetingRoom, RoomBooking, Participant, RoomSchedule, TimeSlot, RoomFormData, BookingFormData, MeetingRoomStats, RoomSearchFilters } from '../types';

// ===================================
// Meeting Room Service
// ===================================
class MeetingRoomService {
  private roomsCollectionName = 'meeting_rooms';
  private bookingsCollectionName = 'room_bookings';

  // Generate booking number
  private generateBookingNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BKG-${year}${month}${day}-${random}`;
  }

  // Check if time slot is available
  private async isTimeSlotAvailable(
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.bookingsCollectionName),
        where('roomId', '==', roomId),
        where('bookingDate', '==', date),
        where('status', 'in', ['pending', 'confirmed', 'in-progress'])
      );
      const querySnapshot = await getDocs(q);
      
      const bookings = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as RoomBooking))
        .filter(booking => excludeBookingId ? booking.id !== excludeBookingId : true);

      // Check for overlapping bookings
      for (const booking of bookings) {
        const existingStart = booking.startTime;
        const existingEnd = booking.endTime;
        
        // Check if times overlap
        if (
          (startTime >= existingStart && startTime < existingEnd) ||
          (endTime > existingStart && endTime <= existingEnd) ||
          (startTime <= existingStart && endTime >= existingEnd)
        ) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      throw error;
    }
  }

  // Calculate duration in minutes
  private calculateDuration(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60);
  }

  // ===== Room Management =====

  // Get room by ID
  async getRoom(roomId: string): Promise<MeetingRoom | null> {
    try {
      const docRef = doc(db, this.roomsCollectionName, roomId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as MeetingRoom;
      }
      return null;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  }

  // Get all rooms
  async getAllRooms(): Promise<MeetingRoom[]> {
    try {
      const q = query(
        collection(db, this.roomsCollectionName),
        where('isActive', '==', true),
        orderBy('roomName')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MeetingRoom));
    } catch (error) {
      console.error('Error getting rooms:', error);
      throw error;
    }
  }

  // Get available rooms
  async getAvailableRooms(): Promise<MeetingRoom[]> {
    try {
      const q = query(
        collection(db, this.roomsCollectionName),
        where('isActive', '==', true),
        where('status', '==', 'available'),
        orderBy('roomName')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MeetingRoom));
    } catch (error) {
      console.error('Error getting available rooms:', error);
      throw error;
    }
  }

  // Search rooms with filters
  async searchRooms(filters: RoomSearchFilters): Promise<MeetingRoom[]> {
    try {
      let rooms = await this.getAllRooms();
      
      // Filter by capacity
      if (filters.minCapacity) {
        rooms = rooms.filter(room => room.capacity >= filters.minCapacity!);
      }
      
      // Filter by building
      if (filters.building) {
        rooms = rooms.filter(room => room.building === filters.building);
      }
      
      // Filter by floor
      if (filters.floor !== undefined) {
        rooms = rooms.filter(room => room.floor === filters.floor);
      }
      
      // Filter by facilities
      if (filters.facilities && filters.facilities.length > 0) {
        rooms = rooms.filter(room =>
          filters.facilities!.every(facility =>
            room.facilities.includes(facility)
          )
        );
      }
      
      // Filter by availability for specific time slot
      if (filters.date && filters.startTime && filters.endTime) {
        const availableRooms: MeetingRoom[] = [];
        
        for (const room of rooms) {
          const isAvailable = await this.isTimeSlotAvailable(
            room.id,
            filters.date,
            filters.startTime,
            filters.endTime
          );
          
          if (isAvailable) {
            availableRooms.push(room);
          }
        }
        
        return availableRooms;
      }
      
      return rooms;
    } catch (error) {
      console.error('Error searching rooms:', error);
      throw error;
    }
  }

  // Create room
  async createRoom(data: RoomFormData): Promise<string> {
    try {
      const roomNumber = `R-${data.floor}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
      
      const docRef = await addDoc(collection(db, this.roomsCollectionName), {
        roomNumber,
        roomName: data.roomName,
        floor: data.floor,
        building: data.building,
        capacity: data.capacity,
        status: 'available',
        facilities: data.facilities,
        description: data.description,
        images: [],
        isActive: true,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  // Update room
  async updateRoom(roomId: string, data: Partial<RoomFormData>): Promise<void> {
    try {
      const docRef = doc(db, this.roomsCollectionName, roomId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  }

  // Update room status
  async updateRoomStatus(roomId: string, status: MeetingRoom['status']): Promise<void> {
    try {
      const docRef = doc(db, this.roomsCollectionName, roomId);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error updating room status:', error);
      throw error;
    }
  }

  // Delete room
  async deleteRoom(roomId: string): Promise<void> {
    try {
      const docRef = doc(db, this.roomsCollectionName, roomId);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }

  // ===== Booking Management =====

  // Create booking
  async createBooking(
    organizer: string,
    organizerId: string,
    department: string,
    data: BookingFormData
  ): Promise<string> {
    try {
      // Check if time slot is available
      const isAvailable = await this.isTimeSlotAvailable(
        data.roomId,
        data.bookingDate,
        data.startTime,
        data.endTime
      );
      
      if (!isAvailable) {
        throw new Error('Time slot is not available');
      }

      // Get room info
      const room = await this.getRoom(data.roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const bookingNumber = this.generateBookingNumber();
      const duration = this.calculateDuration(data.startTime, data.endTime);

      // Add participant IDs
      const participants: Participant[] = data.participants.map((p, index) => ({
        id: `part-${index + 1}`,
        ...p,
        status: 'invited',
      }));

      const docRef = await addDoc(collection(db, this.bookingsCollectionName), {
        bookingNumber,
        roomId: data.roomId,
        roomName: room.roomName,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        duration,
        organizer,
        organizerId,
        department,
        meetingTitle: data.meetingTitle,
        meetingType: data.meetingType,
        participants,
        expectedAttendees: data.expectedAttendees,
        agenda: data.agenda,
        requirements: data.requirements || [],
        status: 'pending',
        setupTime: data.setupTime || 0,
        cleanupTime: data.cleanupTime || 0,
        recurringType: data.recurringType || 'none',
        recurringEndDate: data.recurringEndDate,
        notes: data.notes,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Get booking by ID
  async getBooking(bookingId: string): Promise<RoomBooking | null> {
    try {
      const docRef = doc(db, this.bookingsCollectionName, bookingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as RoomBooking;
      }
      return null;
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  // Get all bookings
  async getAllBookings(): Promise<RoomBooking[]> {
    try {
      const q = query(collection(db, this.bookingsCollectionName), orderBy('bookingDate', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RoomBooking));
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw error;
    }
  }

  // Get bookings by date
  async getBookingsByDate(date: string): Promise<RoomBooking[]> {
    try {
      const q = query(
        collection(db, this.bookingsCollectionName),
        where('bookingDate', '==', date),
        orderBy('startTime')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RoomBooking));
    } catch (error) {
      console.error('Error getting bookings by date:', error);
      throw error;
    }
  }

  // Get bookings by room
  async getBookingsByRoom(roomId: string): Promise<RoomBooking[]> {
    try {
      const q = query(
        collection(db, this.bookingsCollectionName),
        where('roomId', '==', roomId),
        orderBy('bookingDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RoomBooking));
    } catch (error) {
      console.error('Error getting bookings by room:', error);
      throw error;
    }
  }

  // Get bookings by organizer
  async getBookingsByOrganizer(organizerId: string): Promise<RoomBooking[]> {
    try {
      const q = query(
        collection(db, this.bookingsCollectionName),
        where('organizerId', '==', organizerId),
        orderBy('bookingDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RoomBooking));
    } catch (error) {
      console.error('Error getting bookings by organizer:', error);
      throw error;
    }
  }

  // Get room schedule
  async getRoomSchedule(roomId: string, date: string): Promise<RoomSchedule> {
    try {
      const bookings = await this.getBookingsByDate(date);
      const roomBookings = bookings.filter(b => b.roomId === roomId);
      
      // Generate available time slots (8:00 - 18:00)
      const availableSlots: TimeSlot[] = [];
      const workStart = 8;
      const workEnd = 18;
      
      for (let hour = workStart; hour < workEnd; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        
        const isBooked = roomBookings.some(booking => {
          return (
            (startTime >= booking.startTime && startTime < booking.endTime) ||
            (endTime > booking.startTime && endTime <= booking.endTime) ||
            (startTime <= booking.startTime && endTime >= booking.endTime)
          );
        });
        
        availableSlots.push({
          startTime,
          endTime,
          duration: 60,
          isAvailable: !isBooked,
        });
      }
      
      return {
        roomId,
        date,
        bookings: roomBookings,
        availableSlots,
      };
    } catch (error) {
      console.error('Error getting room schedule:', error);
      throw error;
    }
  }

  // Update booking
  async updateBooking(bookingId: string, data: Partial<BookingFormData>): Promise<void> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString(),
      };

      // Recalculate duration if times changed
      if (data.startTime && data.endTime) {
        updateData.duration = this.calculateDuration(data.startTime, data.endTime);
        
        // Check availability for new time
        const booking = await this.getBooking(bookingId);
        if (booking) {
          const isAvailable = await this.isTimeSlotAvailable(
            booking.roomId,
            booking.bookingDate,
            data.startTime,
            data.endTime,
            bookingId
          );
          
          if (!isAvailable) {
            throw new Error('New time slot is not available');
          }
        }
      }

      const docRef = doc(db, this.bookingsCollectionName, bookingId);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  // Confirm booking
  async confirmBooking(bookingId: string): Promise<void> {
    try {
      const docRef = doc(db, this.bookingsCollectionName, bookingId);
      await updateDoc(docRef, {
        status: 'confirmed',
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: string, cancellationReason: string): Promise<void> {
    try {
      const docRef = doc(db, this.bookingsCollectionName, bookingId);
      await updateDoc(docRef, {
        status: 'cancelled',
        cancellationReason,
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Check in to meeting
  async checkInToMeeting(bookingId: string, participantId: string): Promise<void> {
    try {
      const booking = await this.getBooking(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const participants = booking.participants.map(p => {
        if (p.id === participantId) {
          return {
            ...p,
            status: 'accepted' as const,
            checkInTime: Timestamp.now().toDate().toISOString(),
          };
        }
        return p;
      });

      const docRef = doc(db, this.bookingsCollectionName, bookingId);
      await updateDoc(docRef, {
        participants,
        status: 'in-progress',
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error checking in to meeting:', error);
      throw error;
    }
  }

  // Complete meeting
  async completeMeeting(bookingId: string): Promise<void> {
    try {
      const docRef = doc(db, this.bookingsCollectionName, bookingId);
      await updateDoc(docRef, {
        status: 'completed',
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error completing meeting:', error);
      throw error;
    }
  }

  // Delete booking
  async deleteBooking(bookingId: string): Promise<void> {
    try {
      const docRef = doc(db, this.bookingsCollectionName, bookingId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }

  // ===== Statistics =====

  // Get meeting room statistics
  async getMeetingRoomStats(): Promise<MeetingRoomStats> {
    try {
      const rooms = await this.getAllRooms();
      const today = new Date().toISOString().split('T')[0];
      const bookingsToday = await this.getBookingsByDate(today);
      
      // Get bookings for this week and month
      const allBookings = await this.getAllBookings();
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const bookingsThisWeek = allBookings.filter(b =>
        new Date(b.bookingDate) >= startOfWeek
      );
      
      const bookingsThisMonth = allBookings.filter(b =>
        new Date(b.bookingDate) >= startOfMonth
      );

      // Calculate occupancy rate
      const totalRoomHours = rooms.length * 10; // 10 hours per day (8:00 - 18:00)
      const bookedHours = bookingsToday.reduce((sum, b) => sum + (b.duration / 60), 0);
      const occupancyRate = totalRoomHours > 0 ? (bookedHours / totalRoomHours) * 100 : 0;

      // Find most booked room
      const roomBookingCounts: Record<string, number> = {};
      allBookings.forEach(booking => {
        roomBookingCounts[booking.roomName] = (roomBookingCounts[booking.roomName] || 0) + 1;
      });
      
      const mostBookedRoom = Object.entries(roomBookingCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      // Find peak booking time
      const hourCounts: Record<number, number> = {};
      allBookings.forEach(booking => {
        const hour = parseInt(booking.startTime.split(':')[0]);
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      
      const peakHour = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '9';
      
      const peakBookingTime = `${peakHour}:00`;

      const stats: MeetingRoomStats = {
        totalRooms: rooms.length,
        availableRooms: rooms.filter(r => r.status === 'available').length,
        occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
        totalBookingsToday: bookingsToday.length,
        totalBookingsThisWeek: bookingsThisWeek.length,
        totalBookingsThisMonth: bookingsThisMonth.length,
        averageOccupancyRate: Math.round(occupancyRate * 100) / 100,
        mostBookedRoom,
        peakBookingTime,
      };

      return stats;
    } catch (error) {
      console.error('Error getting meeting room stats:', error);
      throw error;
    }
  }
}

// ===================================
// Export Service Instance
// ===================================
export const meetingRoomService = new MeetingRoomService();
