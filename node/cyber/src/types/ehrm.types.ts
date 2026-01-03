// ===================================
// eHRM (Employee Human Resource Management) Types
// ===================================

// Employee Profile Types
export interface Employee {
  id: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  avatar?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'work-from-home';
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalWorkFromHome: number;
  attendanceRate: number;
}

// Leave Management Types
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'annual' | 'sick' | 'emergency' | 'unpaid' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  annual: number;
  sick: number;
  emergency: number;
  used: {
    annual: number;
    sick: number;
    emergency: number;
  };
  year: number;
}

// Form Data Types
export interface AttendanceFormData {
  employeeId: string;
  status: Attendance['status'];
  checkIn?: string;
  checkOut?: string;
  location?: Attendance['location'];
  notes?: string;
}

export interface LeaveFormData {
  leaveType: LeaveRequest['leaveType'];
  startDate: string;
  endDate: string;
  reason: string;
  attachments?: File[];
}

export interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  address?: string;
  emergencyContact?: Employee['emergencyContact'];
}
