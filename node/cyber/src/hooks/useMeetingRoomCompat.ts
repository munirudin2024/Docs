// Compatibility hooks for Meeting Room integration
import { useState } from 'react';
import type { MeetingRoom, RoomBooking } from '../types';

export const useMeetingRoomsCompat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);

  return { meetingRooms, isLoading };
};

export const useRoomBookingsCompat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);

  return { bookings, isLoading };
};
