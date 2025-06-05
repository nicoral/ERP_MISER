import type { BaseFilters } from './generic';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  role: string;
  active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployeeFilters extends BaseFilters {
  firstName?: string;
  lastName?: string;
} 