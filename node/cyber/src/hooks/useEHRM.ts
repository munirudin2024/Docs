import { useState, useEffect, useCallback } from 'react';
import { profileService, attendanceService, leaveService } from '../services';
import type {
  Employee,
  Attendance,
  LeaveRequest,
  LeaveBalance,
  AttendanceFormData,
  LeaveFormData,
  ProfileFormData,
  AttendanceStats,
} from '../types';

// ===================================
// Profile Hooks
// ===================================

export const useEmployee = (employeeId: string) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const data = await profileService.getEmployee(employeeId);
        setEmployee(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch employee');
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId]);

  const updateEmployee = useCallback(async (data: Partial<ProfileFormData>) => {
    try {
      await profileService.updateEmployee(employeeId, data);
      const updated = await profileService.getEmployee(employeeId);
      setEmployee(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
      return false;
    }
  }, [employeeId]);

  return { employee, loading, error, updateEmployee };
};

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileService.getAllEmployees();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, loading, error, refetch: fetchEmployees };
};

// ===================================
// Attendance Hooks
// ===================================

export const useAttendance = (employeeId: string, date: string) => {
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getAttendanceByDate(employeeId, date);
      setAttendance(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  }, [employeeId, date]);

  useEffect(() => {
    if (employeeId && date) {
      fetchAttendance();
    }
  }, [employeeId, date, fetchAttendance]);

  const checkIn = useCallback(async (data: AttendanceFormData) => {
    try {
      await attendanceService.checkIn(data);
      await fetchAttendance();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in');
      return false;
    }
  }, [fetchAttendance]);

  const checkOut = useCallback(async (attendanceId: string) => {
    try {
      await attendanceService.checkOut(attendanceId);
      await fetchAttendance();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check out');
      return false;
    }
  }, [fetchAttendance]);

  return { attendance, loading, error, checkIn, checkOut, refetch: fetchAttendance };
};

export const useAttendanceHistory = (employeeId: string, startDate: string, endDate: string) => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getAttendanceHistory(employeeId, startDate, endDate);
      setAttendances(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance history');
    } finally {
      setLoading(false);
    }
  }, [employeeId, startDate, endDate]);

  useEffect(() => {
    if (employeeId && startDate && endDate) {
      fetchHistory();
    }
  }, [employeeId, startDate, endDate, fetchHistory]);

  return { attendances, loading, error, refetch: fetchHistory };
};

export const useAttendanceStats = (employeeId: string, month: string) => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getAttendanceStats(employeeId, month);
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch attendance stats');
      } finally {
        setLoading(false);
      }
    };

    if (employeeId && month) {
      fetchStats();
    }
  }, [employeeId, month]);

  return { stats, loading, error };
};

// ===================================
// Leave Hooks
// ===================================

export const useLeaveRequests = (employeeId: string) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await leaveService.getLeaveRequests(employeeId);
      setLeaveRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      fetchLeaveRequests();
    }
  }, [employeeId, fetchLeaveRequests]);

  const submitLeaveRequest = useCallback(async (employeeName: string, data: LeaveFormData) => {
    try {
      await leaveService.submitLeaveRequest(employeeId, employeeName, data);
      await fetchLeaveRequests();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit leave request');
      return false;
    }
  }, [employeeId, fetchLeaveRequests]);

  const cancelLeaveRequest = useCallback(async (requestId: string) => {
    try {
      await leaveService.cancelLeaveRequest(requestId);
      await fetchLeaveRequests();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel leave request');
      return false;
    }
  }, [fetchLeaveRequests]);

  return { leaveRequests, loading, error, submitLeaveRequest, cancelLeaveRequest, refetch: fetchLeaveRequests };
};

export const usePendingLeaveRequests = () => {
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await leaveService.getPendingLeaveRequests();
      setPendingRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const approveRequest = useCallback(async (requestId: string, approvedBy: string) => {
    try {
      await leaveService.approveLeaveRequest(requestId, approvedBy);
      await fetchPendingRequests();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
      return false;
    }
  }, [fetchPendingRequests]);

  const rejectRequest = useCallback(async (requestId: string, approvedBy: string, reason: string) => {
    try {
      await leaveService.rejectLeaveRequest(requestId, approvedBy, reason);
      await fetchPendingRequests();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
      return false;
    }
  }, [fetchPendingRequests]);

  return { pendingRequests, loading, error, approveRequest, rejectRequest, refetch: fetchPendingRequests };
};

export const useLeaveBalance = (employeeId: string) => {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const data = await leaveService.getLeaveBalance(employeeId);
        setBalance(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leave balance');
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchBalance();
    }
  }, [employeeId]);

  return { balance, loading, error };
};
