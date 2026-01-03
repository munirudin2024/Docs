import { db } from '../config/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import type { Employee, Attendance, LeaveRequest, LeaveBalance, AttendanceFormData, LeaveFormData, ProfileFormData, AttendanceStats } from '../types';

// ===================================
// Employee Profile Service
// ===================================
class ProfileService {
  private collectionName = 'employees';

  // Get employee by ID
  async getEmployee(employeeId: string): Promise<Employee | null> {
    try {
      const docRef = doc(db, this.collectionName, employeeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Employee;
      }
      return null;
    } catch (error) {
      console.error('Error getting employee:', error);
      throw error;
    }
  }

  // Get all employees
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('fullName'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Employee));
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  }

  // Get employees by department
  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('department', '==', department),
        orderBy('fullName')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Employee));
    } catch (error) {
      console.error('Error getting employees by department:', error);
      throw error;
    }
  }

  // Create employee
  async createEmployee(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  // Update employee
  async updateEmployee(employeeId: string, data: Partial<ProfileFormData>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, employeeId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  // Delete employee
  async deleteEmployee(employeeId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, employeeId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  // Update employee status
  async updateEmployeeStatus(employeeId: string, status: Employee['status']): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, employeeId);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error updating employee status:', error);
      throw error;
    }
  }
}

// ===================================
// Attendance Service
// ===================================
class AttendanceService {
  private collectionName = 'attendances';

  // Check in
  async checkIn(data: AttendanceFormData): Promise<string> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        date: today,
        checkIn: new Date().toISOString(),
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  }

  // Check out
  async checkOut(attendanceId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, attendanceId);
      await updateDoc(docRef, {
        checkOut: new Date().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error checking out:', error);
      throw error;
    }
  }

  // Get attendance by employee and date
  async getAttendanceByDate(employeeId: string, date: string): Promise<Attendance | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('employeeId', '==', employeeId),
        where('date', '==', date),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Attendance;
      }
      return null;
    } catch (error) {
      console.error('Error getting attendance:', error);
      throw error;
    }
  }

  // Get attendance history
  async getAttendanceHistory(employeeId: string, startDate: string, endDate: string): Promise<Attendance[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('employeeId', '==', employeeId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Attendance));
    } catch (error) {
      console.error('Error getting attendance history:', error);
      throw error;
    }
  }

  // Get all attendances for a date
  async getAllAttendancesByDate(date: string): Promise<Attendance[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('date', '==', date),
        orderBy('checkIn', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Attendance));
    } catch (error) {
      console.error('Error getting attendances by date:', error);
      throw error;
    }
  }

  // Get attendance statistics
  async getAttendanceStats(employeeId: string, month: string): Promise<AttendanceStats> {
    try {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      
      const attendances = await this.getAttendanceHistory(employeeId, startDate, endDate);
      
      const stats: AttendanceStats = {
        totalPresent: attendances.filter(a => a.status === 'present').length,
        totalAbsent: attendances.filter(a => a.status === 'absent').length,
        totalLate: attendances.filter(a => a.status === 'late').length,
        totalWorkFromHome: attendances.filter(a => a.status === 'work-from-home').length,
        attendanceRate: 0,
      };
      
      const totalWorkDays = attendances.length;
      stats.attendanceRate = totalWorkDays > 0 
        ? ((stats.totalPresent + stats.totalWorkFromHome) / totalWorkDays) * 100 
        : 0;
      
      return stats;
    } catch (error) {
      console.error('Error getting attendance stats:', error);
      throw error;
    }
  }

  // Update attendance
  async updateAttendance(attendanceId: string, data: Partial<AttendanceFormData>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, attendanceId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }

  // Delete attendance
  async deleteAttendance(attendanceId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, attendanceId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  }
}

// ===================================
// Leave Management Service
// ===================================
class LeaveService {
  private collectionName = 'leave_requests';
  private balanceCollectionName = 'leave_balances';

  // Submit leave request
  async submitLeaveRequest(employeeId: string, employeeName: string, data: LeaveFormData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        employeeId,
        employeeName,
        ...data,
        status: 'pending',
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting leave request:', error);
      throw error;
    }
  }

  // Get leave request by ID
  async getLeaveRequest(requestId: string): Promise<LeaveRequest | null> {
    try {
      const docRef = doc(db, this.collectionName, requestId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as LeaveRequest;
      }
      return null;
    } catch (error) {
      console.error('Error getting leave request:', error);
      throw error;
    }
  }

  // Get leave requests by employee
  async getLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaveRequest));
    } catch (error) {
      console.error('Error getting leave requests:', error);
      throw error;
    }
  }

  // Get all pending leave requests
  async getPendingLeaveRequests(): Promise<LeaveRequest[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LeaveRequest));
    } catch (error) {
      console.error('Error getting pending leave requests:', error);
      throw error;
    }
  }

  // Approve leave request
  async approveLeaveRequest(requestId: string, approvedBy: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, requestId);
      await updateDoc(docRef, {
        status: 'approved',
        approvedBy,
        approvalDate: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw error;
    }
  }

  // Reject leave request
  async rejectLeaveRequest(requestId: string, approvedBy: string, rejectionReason: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, requestId);
      await updateDoc(docRef, {
        status: 'rejected',
        approvedBy,
        rejectionReason,
        approvalDate: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      throw error;
    }
  }

  // Cancel leave request
  async cancelLeaveRequest(requestId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, requestId);
      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      throw error;
    }
  }

  // Get leave balance
  async getLeaveBalance(employeeId: string): Promise<LeaveBalance | null> {
    try {
      const currentYear = new Date().getFullYear();
      const q = query(
        collection(db, this.balanceCollectionName),
        where('employeeId', '==', employeeId),
        where('year', '==', currentYear),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { ...doc.data() } as LeaveBalance;
      }
      
      // Create default balance if not exists
      const defaultBalance: LeaveBalance = {
        employeeId,
        annual: 12,
        sick: 12,
        emergency: 3,
        used: {
          annual: 0,
          sick: 0,
          emergency: 0,
        },
        year: currentYear,
      };
      
      await addDoc(collection(db, this.balanceCollectionName), defaultBalance);
      return defaultBalance;
    } catch (error) {
      console.error('Error getting leave balance:', error);
      throw error;
    }
  }

  // Update leave balance
  async updateLeaveBalance(employeeId: string, leaveType: string, days: number): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      const q = query(
        collection(db, this.balanceCollectionName),
        where('employeeId', '==', employeeId),
        where('year', '==', currentYear),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const currentData = querySnapshot.docs[0].data() as LeaveBalance;
        
        await updateDoc(docRef, {
          [`used.${leaveType}`]: (currentData.used[leaveType as keyof LeaveBalance['used']] || 0) + days,
        });
      }
    } catch (error) {
      console.error('Error updating leave balance:', error);
      throw error;
    }
  }
}

// ===================================
// Export Service Instances
// ===================================
export const profileService = new ProfileService();
export const attendanceService = new AttendanceService();
export const leaveService = new LeaveService();
