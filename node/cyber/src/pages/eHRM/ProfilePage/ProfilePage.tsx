import { MainLayout } from '../../../components';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="profile-page">
        <div className="page-header">
          <h1>👤 My Profile</h1>
          <p>Kelola informasi profil Anda</p>
        </div>

        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                <span className="avatar-icon">👤</span>
              </div>
              <h3>Spare Part User</h3>
              <p className="profile-role">Employee</p>
              <button className="btn btn-outline">Change Photo</button>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">Employee ID</span>
                <span className="stat-value">EMP-2024-001</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Department</span>
                <span className="stat-value">Operations</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Join Date</span>
                <span className="stat-value">1 Jan 2024</span>
              </div>
            </div>
          </div>

          <div className="profile-content">
            <div className="card">
              <h3 className="card-title">Personal Information</h3>
              <form className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-control" defaultValue="Spare Part User" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-control" defaultValue="spare.part@sriboga.com" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" className="form-control" defaultValue="+62 812-3456-7890" />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" className="form-control" defaultValue="1990-01-15" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea className="form-control" rows={3} defaultValue="Jl. Raya Bekasi KM 28, Jakarta Timur"></textarea>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>

            <div className="card">
              <h3 className="card-title">🔐 Change Password</h3>
              <form className="profile-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" className="form-control" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" className="form-control" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" className="form-control" />
                </div>
                <button type="submit" className="btn btn-primary">Update Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
