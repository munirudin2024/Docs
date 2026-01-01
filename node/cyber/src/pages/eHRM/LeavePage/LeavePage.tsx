import { MainLayout } from '../../../components';
import './LeavePage.css';

export const LeavePage: React.FC = () => {
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
              <h3>12</h3>
              <p>Total Leave Days</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <h3>8</h3>
              <p>Days Used</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⏰</div>
            <div className="summary-content">
              <h3>4</h3>
              <p>Days Remaining</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🔄</div>
            <div className="summary-content">
              <h3>5</h3>
              <p>Carry Forward</p>
            </div>
          </div>
        </div>

        <div className="page-grid">
          <div className="card">
            <h3 className="card-title">📝 Request Leave</h3>
            <form className="leave-form">
              <div className="form-group">
                <label>Leave Type</label>
                <select className="form-control">
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Emergency Leave</option>
                  <option>Unpaid Leave</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" className="form-control" />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" className="form-control" />
                </div>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <textarea className="form-control" rows={4} placeholder="Alasan mengambil cuti..."></textarea>
              </div>

              <div className="form-group">
                <label>Backup Person</label>
                <select className="form-control">
                  <option>John Doe</option>
                  <option>Jane Smith</option>
                  <option>Robert Brown</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-block">Submit Request</button>
            </form>
          </div>

          <div className="card">
            <h3 className="card-title">📜 Leave History</h3>
            <div className="leave-history">
              <div className="leave-item status-approved">
                <div className="leave-header">
                  <h4>Annual Leave</h4>
                  <span className="leave-status badge-approved">Approved</span>
                </div>
                <p className="leave-date">📅 20-22 Des 2025 (3 days)</p>
                <p className="leave-reason">Reason: Family vacation</p>
              </div>

              <div className="leave-item status-pending">
                <div className="leave-header">
                  <h4>Sick Leave</h4>
                  <span className="leave-status badge-pending">Pending</span>
                </div>
                <p className="leave-date">📅 5-6 Jan 2026 (2 days)</p>
                <p className="leave-reason">Reason: Medical checkup</p>
              </div>

              <div className="leave-item status-rejected">
                <div className="leave-header">
                  <h4>Annual Leave</h4>
                  <span className="leave-status badge-rejected">Rejected</span>
                </div>
                <p className="leave-date">📅 10-15 Des 2025 (6 days)</p>
                <p className="leave-reason">Reason: Too many requests in that period</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
