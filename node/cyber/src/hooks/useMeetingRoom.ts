import { useState, useEffect, useCallback } from 'react';
import { meetingRoomService } from '../services';
import type {
  MeetingRoom,
  RoomBooking,
  RoomSchedule,
  RoomFormData,
  BookingFormData,
  MeetingRoomStats,
  RoomSearchFilters,
} from '../types';

// ===================================
// Room Hooks
// ===================================

export const useMeetingRoom = (roomId: string) => {
  const [room, setRoom] = useState<MeetingRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const data = await meetingRoomService.getRoom(roomId);
        setRoom(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch room');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  return { room, loading, error };
};

export const useMeetingRooms = () => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await meetingRoomService.getAllRooms();
      setRooms(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = useCallback(async (data: RoomFormData) => {
    try {
      await meetingRoomService.createRoom(data);
      await fetchRooms();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      return false;
    }
  }, [fetchRooms]);

  const updateRoom = useCallback(async (roomId: string, data: Partial<RoomFormData>) => {
    try {
      await meetingRoomService.updateRoom(roomId, data);
      await fetchRooms();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update room');
      return false;
    }
  }, [fetchRooms]);

  const deleteRoom = useCallback(async (roomId: string) => {
    try {
      await meetingRoomService.deleteRoom(roomId);
      await fetchRooms();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room');
      return false;
    }
  }, [fetchRooms]);

  const updateRoomStatus = useCallback(async (roomId: string, status: MeetingRoom['status']) => {
    try {
      await meetingRoomService.updateRoomStatus(roomId, status);
      await fetchRooms();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update room status');
      return false;
    }
  }, [fetchRooms]);

  return { rooms, loading, error, createRoom, updateRoom, deleteRoom, updateRoomStatus, refetch: fetchRooms };
};

export const useAvailableRooms = () => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await meetingRoomService.getAvailableRooms();
        setRooms(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch available rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return { rooms, loading, error };
};

export const useRoomSearch = (filters: RoomSearchFilters) => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await meetingRoomService.searchRooms(filters);
      setRooms(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search rooms');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    searchRooms();
  }, [searchRooms]);

  return { rooms, loading, error, refetch: searchRooms };
};

// ===================================
// Booking Hooks
// ===================================

export const useRoomBooking = (bookingId: string) => {
  const [booking, setBooking] = useState<RoomBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const data = await meetingRoomService.getBooking(bookingId);
      setBooking(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, fetchBooking]);

  return { booking, loading, error, refetch: fetchBooking };
};

export const useRoomBookings = () => {
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await meetingRoomService.getAllBookings();
      setBookings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = useCallback(async (
    organizer: string,
    organizerId: string,
    department: string,
    data: BookingFormData
  ) => {
    try {
      await meetingRoomService.createBooking(organizer, organizerId, department, data);
      await fetchBookings();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      return false;
    }
  }, [fetchBookings]);

  const updateBooking = useCallback(async (bookingId: string, data: Partial<BookingFormData>) => {
    try {
      await meetingRoomService.updateBooking(bookingId, data);
      await fetchBookings();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
      return false;
    }
  }, [fetchBookings]);

  const confirmBooking = useCallback(async (bookingId: string) => {
    try {
      await meetingRoomService.confirmBooking(bookingId);
      await fetchBookings();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
      return false;
    }
  }, [fetchBookings]);

  const cancelBooking = useCallback(async (bookingId: string, reason: string) => {
    try {
      await meetingRoomService.cancelBooking(bookingId, reason);
      await fetchBookings();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      return false;
    }
  }, [fetchBookings]);

  const completeBooking = useCallback(async (bookingId: string) => {
    try {
      await meetingRoomService.completeMeeting(bookingId);
      await fetchBookings();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete booking');
      return false;
    }
  }, [fetchBookings]);

  const deleteBooking = useCallback(async (bookingId: string) => {
    try {
      await meetingRoomService.deleteBooking(bookingId);
      await fetchBookings();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete booking');
      return false;
    }
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    confirmBooking,
    cancelBooking,
    completeBooking,
    deleteBooking,
    refetch: fetchBookings,
  };
};

export const useBookingsByDate = (date: string) => {
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await meetingRoomService.getBookingsByDate(date);
        setBookings(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    if (date) {
      fetchBookings();
    }
  }, [date]);

  return { bookings, loading, error };
};

export const useMyBookings = (organizerId: string) => {
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await meetingRoomService.getBookingsByOrganizer(organizerId);
        setBookings(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch my bookings');
      } finally {
        setLoading(false);
      }
    };

    if (organizerId) {
      fetchBookings();
    }
  }, [organizerId]);

  return { bookings, loading, error };
};

export const useRoomSchedule = (roomId: string, date: string) => {
  const [schedule, setSchedule] = useState<RoomSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const data = await meetingRoomService.getRoomSchedule(roomId, date);
      setSchedule(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch room schedule');
    } finally {
      setLoading(false);
    }
  }, [roomId, date]);

  useEffect(() => {
    if (roomId && date) {
      fetchSchedule();
    }
  }, [roomId, date, fetchSchedule]);

  return { schedule, loading, error, refetch: fetchSchedule };
};

// ===================================
// Meeting Room Stats Hook
// ===================================

export const useMeetingRoomStats = () => {
  const [stats, setStats] = useState<MeetingRoomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await meetingRoomService.getMeetingRoomStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting room stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
