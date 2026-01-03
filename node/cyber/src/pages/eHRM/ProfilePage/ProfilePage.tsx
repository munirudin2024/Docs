import { useState } from 'react';
import { MainLayout, Button, Input } from '../../../components';
import { useEmployee } from '../../../hooks';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const { employee, updateEmployee, isLoading } = useEmployee();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: employee?.fullName || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    dateOfBirth: employee?.dateOfBirth || '',
    address: employee?.address || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEmployee(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="profile-page">
          <div className="loading">Loading profile...</div>
        </div>
      </MainLayout>
    );
  }

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
              <h3>{employee?.fullName || 'User'}</h3>
              <p className="profile-role">{employee?.position || 'Employee'}</p>
              <Button className="btn-outline">Change Photo</Button>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">Employee ID</span>
                <span className="stat-value">{employee?.employeeId || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Department</span>
                <span className="stat-value">{employee?.department || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Join Date</span>
                <span className="stat-value">{employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString('id-ID') : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="profile-content">
            <div className="card">
              <h3 className="card-title">Personal Information</h3>
              <form className="profile-form" onSubmit={handleSaveChanges}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <Input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <Input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <Input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <Input 
                      type="date" 
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea 
                    name="address"
                    className="form-control" 
                    rows={3} 
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  ></textarea>
                </div>

                <div className="form-actions">
                  {!isEditing ? (
                    <Button 
                      type="button" 
                      onClick={() => setIsEditing(true)}
                      className="btn-primary"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        type="button" 
                        onClick={() => setIsEditing(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </div>

            <div className="card">
              <h3 className="card-title">🔐 Change Password</h3>
              <form className="profile-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <Input type="password" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <Input type="password" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <Input type="password" />
                </div>
                <Button type="submit" className="btn-primary">Update Password</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
