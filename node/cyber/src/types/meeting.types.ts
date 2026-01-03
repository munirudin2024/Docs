// ===================================
// Meeting Room Management Types
// ===================================

export interface MeetingRoom {
  id: string;
  roomNumber: string;
  roomName: string;
  floor: number;
  building: string;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  facilities: string[];
  description?: string;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomBooking {
  id: string;
  bookingNumber: string;
  roomId: string;
  roomName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  organizer: string;
  organizerId: string;
  department: string;
  meetingTitle: string;
  meetingType: 'internal' | 'external' | 'training' | 'interview' | 'other';
  participants: Participant[];
  expectedAttendees: number;
  agenda?: string;
  requirements?: string[];
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  setupTime?: number; // minutes before meeting
  cleanupTime?: number; // minutes after meeting
  recurringType?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  department?: string;
  type: 'required' | 'optional' | 'external';
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
  checkInTime?: string;
}

export interface RoomSchedule {
  roomId: string;
  date: string;
  bookings: RoomBooking[];
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
  isAvailable: boolean;
}

// Form Data Types
export interface RoomFormData {
  roomName: string;
  floor: number;
  building: string;
  capacity: number;
  facilities: string[];
  description?: string;
}

export interface BookingFormData {
  roomId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  meetingTitle: string;
  meetingType: RoomBooking['meetingType'];
  participants: Omit<Participant, 'id' | 'status' | 'checkInTime'>[];
  expectedAttendees: number;
  agenda?: string;
  requirements?: string[];
  setupTime?: number;
  cleanupTime?: number;
  recurringType?: RoomBooking['recurringType'];
  recurringEndDate?: string;
  notes?: string;
}

// Statistics Types
export interface MeetingRoomStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  totalBookingsToday: number;
  totalBookingsThisWeek: number;
  totalBookingsThisMonth: number;
  averageOccupancyRate: number;
  mostBookedRoom: string;
  peakBookingTime: string;
}

// Filter Types
export interface RoomSearchFilters {
  date?: string;
  startTime?: string;
  endTime?: string;
  minCapacity?: number;
  building?: string;
  floor?: number;
  facilities?: string[];
}
