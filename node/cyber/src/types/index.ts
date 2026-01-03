// ===================================
// Central Type Exports
// ===================================

// Auth Types
export * from './auth.types';

// eHRM Types
export * from './ehrm.types';

// eSupplyChain Types
export * from './supply.types';

// Helpdesk Types
export * from './helpdesk.types';

// Meeting Room Types
export * from './meeting.types';

// Warehouse Types
export * from './warehouse.types';

// Common/Shared Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'employee' | 'user';
  department?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
