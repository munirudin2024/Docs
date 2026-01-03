import { useState } from 'react';
import { MainLayout, Button, Input } from '../../components';
import { useMeetingRoomsCompat, useRoomBookingsCompat } from '../../hooks/useMeetingRoomCompat';
import './MeetingRoomPage.css';

interface BookingFormData {
  roomId: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: string;
}

export const MeetingRoomPage: React.FC = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    roomId: '',
    title: '',
    startTime: '',
    endTime: '',
    attendees: ''
  });

  const { meetingRooms, isLoading: isLoadingRooms } = useMeetingRoomsCompat();
  const { bookings, isLoading: isLoadingBookings } = useRoomBookingsCompat();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call booking API
      alert('Booking created successfully!');
      setFormData({
        roomId: '',
        title: '',
        startTime: '',
        endTime: '',
        attendees: ''
      });
      setShowBookingForm(false);
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  return (
    <MainLayout>
      <div className="meeting-page">
        <div className="page-header">
          <h1>📅 Meeting Rooms</h1>
          <p>Pesan dan kelola ruang pertemuan</p>
          <Button 
            variant="primary"
            onClick={() => setShowBookingForm(!showBookingForm)}
          >
            + Book Room
          </Button>
        </div>

        {showBookingForm && (
          <div className="card booking-form">
            <h3>Book a Meeting Room</h3>
            <form onSubmit={handleSubmitBooking}>
              <div className="form-row">
                <div className="form-group">
                  <label>Select Room</label>
                  <select 
                    name="roomId"
                    className="form-control"
                    value={formData.roomId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Choose a room...</option>
                    {meetingRooms?.map((room, idx) => (
                      <option key={idx} value={room.id || ''}>
                        {room.name} - Capacity: {room.capacity}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Meeting Title</label>
                  <Input 
                    type="text"
                    name="title"
                    placeholder="Meeting title..."
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <Input 
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <Input 
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Attendees</label>
                <textarea 
                  name="attendees"
                  className="form-control"
                  rows={2}
                  placeholder="List of attendees..."
                  value={formData.attendees}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="form-actions">
                <Button variant="secondary" onClick={() => setShowBookingForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Book Room
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="page-grid">
          <div className="card">
            <h3 className="card-title">🏢 Available Rooms</h3>
            <div className="rooms-grid">
              {isLoadingRooms ? (
                <div className="loading">Loading rooms...</div>
              ) : meetingRooms && meetingRooms.length > 0 ? (
                meetingRooms.map((room: any, index: number) => (
                  <div key={index} className={`room-card status-${room.status || 'available'}`}>
                    <h4>{room.name}</h4>
                    <div className="room-info">
                      <p>👥 Capacity: {room.capacity}</p>
                      <p>📍 Location: {room.location || 'N/A'}</p>
                      <p>🔧 Equipment: {room.amenities?.join(', ') || 'Basic'}</p>
                    </div>
                    <div className="room-status">
                      <span className={`badge badge-${room.status || 'available'}`}>
                        {room.status?.charAt(0).toUpperCase() + room.status?.slice(1) || 'Available'}
                      </span>
                    </div>
                    <Button variant="primary" onClick={() => setShowBookingForm(true)}>
                      Book Now
                    </Button>
                  </div>
                ))
              ) : (
                <div className="empty-state">No rooms available</div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">📋 My Bookings</h3>
            <div className="bookings-list">
              {isLoadingBookings ? (
                <div className="loading">Loading bookings...</div>
              ) : bookings && bookings.length > 0 ? (
                bookings.map((booking: any, index: number) => (
                  <div key={index} className="booking-item">
                    <div className="booking-header">
                      <h4>{booking.meetingTitle || 'Meeting'}</h4>
                      <span className={`badge badge-${booking.status || 'confirmed'}`}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Confirmed'}
                      </span>
                    </div>
                    <p>🏢 {booking.roomName || 'Room'}</p>
                    <p>⏰ {booking.startTime ? new Date(booking.startTime).toLocaleString('id-ID') : 'N/A'}</p>
                    <p>👥 Attendees: {booking.participants?.length || 0}</p>
                  </div>
                ))
              ) : (
                <div className="empty-state">No bookings yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
