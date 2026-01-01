import { MainLayout } from '../../../components';
import './AttendancePage.css';

export const AttendancePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="attendance-page">
        <div className="page-header">
          <h1>⏰ Attendance</h1>
          <p>Kelola kehadiran dan jam kerja Anda</p>
        </div>

        <div className="attendance-actions">
          <div className="clock-card">
            <div className="current-time">
              <div className="time-display">09:45:23</div>
              <div className="date-display">Wednesday, 1 January 2026</div>
            </div>
            <div className="clock-actions">
              <button className="btn btn-success btn-lg">
                <span className="btn-icon">🕐</span>
                Clock In
              </button>
              <button className="btn btn-danger btn-lg" disabled>
                <span className="btn-icon">🕐</span>
                Clock Out
              </button>
            </div>
          </div>
        </div>

        <div className="page-grid">
          <div className="card">
            <h3 className="card-title">📊 Monthly Summary</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-value">22</div>
                <div className="stat-label">Working Days</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">20</div>
                <div className="stat-label">Present</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">2</div>
                <div className="stat-label">Absent</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">0</div>
                <div className="stat-label">Late</div>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <span>Attendance Rate</span>
                <span className="progress-value">91%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '91%' }}></div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">📅 Recent Attendance</h3>
            <div className="attendance-list">
              <div className="attendance-record">
                <div className="record-date">
                  <div className="date-circle">31</div>
                  <div className="date-month">Dec</div>
                </div>
                <div className="record-details">
                  <h4>Full Day</h4>
                  <p>🕐 08:00 - 🕔 17:00</p>
                  <span className="record-badge badge-ontime">On Time</span>
                </div>
              </div>

              <div className="attendance-record">
                <div className="record-date">
                  <div className="date-circle">30</div>
                  <div className="date-month">Dec</div>
                </div>
                <div className="record-details">
                  <h4>Full Day</h4>
                  <p>🕐 08:15 - 🕔 17:05</p>
                  <span className="record-badge badge-late">Late 15 min</span>
                </div>
              </div>

              <div className="attendance-record">
                <div className="record-date">
                  <div className="date-circle">29</div>
                  <div className="date-month">Dec</div>
                </div>
                <div className="record-details">
                  <h4>Half Day</h4>
                  <p>🕐 08:00 - 🕐 12:00</p>
                  <span className="record-badge badge-halfday">Half Day</span>
                </div>
              </div>

              <div className="attendance-record absent">
                <div className="record-date">
                  <div className="date-circle">28</div>
                  <div className="date-month">Dec</div>
                </div>
                <div className="record-details">
                  <h4>Absent</h4>
                  <p>Sick Leave</p>
                  <span className="record-badge badge-absent">Absent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
