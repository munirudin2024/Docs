import { useState } from 'react';
import { MainLayout, Button } from '../../../components';
import { useLeaveRequests, useLeaveBalance, usePendingLeaveRequests } from '../../../hooks';
import './LeavePage.css';

interface LeaveFormData {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  backupPerson: string;
}

export const LeavePage: React.FC = () => {
  const [formData, setFormData] = useState<LeaveFormData>({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
    backupPerson: ''
  });

  const { submitLeaveRequest, isLoading: isSubmitting } = useLeaveRequests();
  const { balance, isLoading: isLoadingBalance } = useLeaveBalance();
  const { leaveRequests, isLoading: isLoadingRequests } = usePendingLeaveRequests();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitLeaveRequest(formData);
      // Reset form
      setFormData({
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: '',
        backupPerson: ''
      });
      alert('Leave request submitted successfully!');
    } catch (error) {
      console.error('Failed to submit leave request:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <MainLayout>
      <div className="leave-page">
        <div className="page-header">
          <h1>📋 Leave Management</h1>
          <p>Kelola cuti dan izin Anda</p>
        </div>

        <div className="leave-summary">
          <div className="summary-card">
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <h3>{balance?.totalDays ?? 12}</h3>
              <p>Total Leave Days</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <h3>{balance?.usedDays ?? 8}</h3>
              <p>Days Used</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⏰</div>
            <div className="summary-content">
              <h3>{balance?.remainingDays ?? 4}</h3>
              <p>Days Remaining</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🔄</div>
            <div className="summary-content">
              <h3>{balance?.carryForwardDays ?? 5}</h3>
              <p>Carry Forward</p>
            </div>
          </div>
        </div>

        <div className="page-grid">
          <div className="card">
            <h3 className="card-title">📝 Request Leave</h3>
            <form className="leave-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Leave Type</label>
                <select 
                  name="leaveType"
                  className="form-control" 
                  value={formData.leaveType}
                  onChange={handleInputChange}
                >
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    name="startDate"
                    className="form-control"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <textarea 
                  name="reason"
                  className="form-control" 
                  rows={4} 
                  placeholder="Alasan mengambil cuti..."
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Backup Person</label>
                <select 
                  name="backupPerson"
                  className="form-control"
                  value={formData.backupPerson}
                  onChange={handleInputChange}
                >
                  <option value="">Select backup person...</option>
                  <option value="john">John Doe</option>
                  <option value="jane">Jane Smith</option>
                  <option value="robert">Robert Brown</option>
                </select>
              </div>

              <Button 
                type="submit" 
                className="btn-primary btn-block"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </div>

          <div className="card">
            <h3 className="card-title">📜 Leave History</h3>
            <div className="leave-history">
              {isLoadingRequests ? (
                <div className="loading">Loading leave requests...</div>
              ) : leaveRequests && leaveRequests.length > 0 ? (
                leaveRequests.map((request, index) => (
                  <div key={index} className={`leave-item status-${request.status}`}>
                    <div className="leave-header">
                      <h4>{request.leaveType}</h4>
                      <span className={`leave-status badge-${request.status}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="leave-date">
                      📅 {new Date(request.startDate).toLocaleDateString('id-ID')} - {new Date(request.endDate).toLocaleDateString('id-ID')}
                    </p>
                    <p className="leave-reason">Reason: {request.reason}</p>
                  </div>
                ))
              ) : (
                <div className="empty-state">No leave requests yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
