import { useState, useEffect } from 'react';
import { MainLayout, Button } from '../../../components';
import { useAttendance, useAttendanceHistory, useAttendanceStats } from '../../../hooks';
import './AttendancePage.css';

export const AttendancePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  
  const { checkIn, checkOut, isLoading: isClockLoading } = useAttendance();
  const { history, isLoading: isHistoryLoading } = useAttendanceHistory();
  const { stats, isLoading: isStatsLoading } = useAttendanceStats();

  // Update current time and date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID'));
      setCurrentDate(now.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if user is already checked in today
  useEffect(() => {
    if (history && history.length > 0) {
      const today = new Date();
      const todayRecord = history.find(h => {
        const recordDate = new Date(h.date);
        return recordDate.toDateString() === today.toDateString();
      });
      setIsCheckedIn(!!todayRecord?.checkInTime && !todayRecord?.checkOutTime);
    }
  }, [history]);

  const handleCheckIn = async () => {
    try {
      await checkIn();
      setIsCheckedIn(true);
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      setIsCheckedIn(false);
    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

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
              <div className="time-display">{currentTime}</div>
              <div className="date-display">{currentDate}</div>
            </div>
            <div className="clock-actions">
              <Button 
                onClick={handleCheckIn} 
                disabled={isCheckedIn || isClockLoading}
                className="btn-success btn-lg"
              >
                <span className="btn-icon">🕐</span>
                {isClockLoading ? 'Loading...' : 'Clock In'}
              </Button>
              <Button 
                onClick={handleCheckOut} 
                disabled={!isCheckedIn || isClockLoading}
                className="btn-danger btn-lg"
              >
                <span className="btn-icon">🕐</span>
                {isClockLoading ? 'Loading...' : 'Clock Out'}
              </Button>
            </div>
          </div>
        </div>

        <div className="page-grid">
          <div className="card">
            <h3 className="card-title">📊 Monthly Summary</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-value">{stats?.workingDays ?? 22}</div>
                <div className="stat-label">Working Days</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{stats?.presentDays ?? 20}</div>
                <div className="stat-label">Present</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{stats?.absentDays ?? 2}</div>
                <div className="stat-label">Absent</div>
              </div>
              <div className="stat-box">
                <div className="stat-value">{stats?.lateDays ?? 0}</div>
                <div className="stat-label">Late</div>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <span>Attendance Rate</span>
                <span className="progress-value">{stats?.attendanceRate ?? 91}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${stats?.attendanceRate ?? 91}%` }}></div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">📅 Recent Attendance</h3>
            <div className="attendance-list">
              {isHistoryLoading ? (
                <div className="loading">Loading attendance records...</div>
              ) : history && history.length > 0 ? (
                history.slice(0, 5).map((record, index) => (
                  <div key={index} className={`attendance-record ${!record.checkOutTime ? 'absent' : ''}`}>
                    <div className="record-date">
                      <div className="date-circle">
                        {new Date(record.date).getDate()}
                      </div>
                      <div className="date-month">
                        {new Date(record.date).toLocaleString('id-ID', { month: 'short' })}
                      </div>
                    </div>
                    <div className="record-details">
                      <h4>{record.checkOutTime ? 'Full Day' : 'Incomplete'}</h4>
                      <p>🕐 {record.checkInTime || '-'} - 🕔 {record.checkOutTime || '-'}</p>
                      <span className={`record-badge badge-${record.status || 'ontime'}`}>
                        {record.status || 'On Time'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No attendance records yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
