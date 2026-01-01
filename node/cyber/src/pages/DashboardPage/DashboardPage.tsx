import { MainLayout } from '../../components';
import './DashboardPage.css';

export const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="dashboard-container">
        {/* Hero Banner */}
        <div className="dashboard-hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="user-profile-large">
              <div className="profile-avatar-large">
                <span className="avatar-icon-large">👤</span>
              </div>
              <h2 className="profile-name">Spare Part User</h2>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <h3 className="stat-title">LEAVES RIGHT</h3>
            <div className="stat-value">12</div>
            <div className="stat-subtitle">Days Available</div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">USED</h3>
            <div className="stat-value">8</div>
            <div className="stat-subtitle">Days Taken</div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">CARRY FORWARD</h3>
            <div className="stat-value">5</div>
            <div className="stat-subtitle">From Last Year</div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">REMAINING</h3>
            <div className="stat-value">9</div>
            <div className="stat-subtitle">Days Left</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3 className="card-title">📋 Quick Actions</h3>
            <div className="quick-actions">
              <button className="action-btn">
                <span className="action-icon">📝</span>
                <span>Request Leave</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">📞</span>
                <span>Submit Ticket</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">📅</span>
                <span>Book Meeting Room</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">📊</span>
                <span>View Reports</span>
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="card-title">📢 Announcements</h3>
            <div className="announcements-list">
              <div className="announcement-item">
                <span className="announcement-date">Today</span>
                <p className="announcement-text">System maintenance scheduled for this weekend</p>
              </div>
              <div className="announcement-item">
                <span className="announcement-date">Yesterday</span>
                <p className="announcement-text">New HR policies updated in the portal</p>
              </div>
              <div className="announcement-item">
                <span className="announcement-date">2 days ago</span>
                <p className="announcement-text">Employee satisfaction survey now available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
