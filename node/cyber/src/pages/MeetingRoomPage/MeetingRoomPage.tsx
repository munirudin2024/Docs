import { MainLayout } from '../../components';
import './MeetingRoomPage.css';

export const MeetingRoomPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="meeting-page">
        <div className="page-header">
          <h1>📅 Meeting Room Booking</h1>
          <p>Booking dan kelola ruangan meeting</p>
        </div>

        <div className="page-grid">
          <div className="card">
            <h3 className="card-title">🏢 Available Rooms</h3>
            <div className="rooms-list">
              <div className="room-card">
                <div className="room-icon">🏛️</div>
                <h4>Board Room</h4>
                <p className="room-capacity">Kapasitas: 20 orang</p>
                <p className="room-facilities">🖥️ Projector, 🎤 Sound System, 📹 Video Conference</p>
                <button className="btn btn-sm btn-primary">Book Now</button>
              </div>

              <div className="room-card">
                <div className="room-icon">💼</div>
                <h4>Meeting Room A</h4>
                <p className="room-capacity">Kapasitas: 10 orang</p>
                <p className="room-facilities">🖥️ Projector, 📹 Video Conference</p>
                <button className="btn btn-sm btn-primary">Book Now</button>
              </div>

              <div className="room-card">
                <div className="room-icon">☕</div>
                <h4>Discussion Room</h4>
                <p className="room-capacity">Kapasitas: 6 orang</p>
                <p className="room-facilities">📺 TV, ⚡ Whiteboard</p>
                <button className="btn btn-sm btn-primary">Book Now</button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">📋 My Bookings</h3>
            <div className="bookings-list">
              <div className="booking-item upcoming">
                <div className="booking-header">
                  <h4>Board Room</h4>
                  <span className="booking-status badge-upcoming">Upcoming</span>
                </div>
                <p className="booking-time">📅 2 Jan 2026, 10:00 - 12:00</p>
                <p className="booking-purpose">Purpose: Quarterly Review Meeting</p>
                <div className="booking-actions">
                  <button className="btn-link">Edit</button>
                  <button className="btn-link danger">Cancel</button>
                </div>
              </div>

              <div className="booking-item completed">
                <div className="booking-header">
                  <h4>Meeting Room A</h4>
                  <span className="booking-status badge-completed">Completed</span>
                </div>
                <p className="booking-time">📅 31 Des 2025, 14:00 - 16:00</p>
                <p className="booking-purpose">Purpose: Team Sync</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
