import type { BaseFilters } from './generic';
import type { Role } from './user';

export interface Employee {
  id: number;
  email: string;
  documentId: string;
  documentType: string;
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  address: string;
  imageUrl: string;
  hireDate: Date;
  dischargeDate: Date | null;
  role: Role;
  active: boolean;
}
export interface EmployeeFilters extends BaseFilters {
  search?: string;
}
