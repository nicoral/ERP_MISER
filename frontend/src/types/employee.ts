import type { BaseFilters } from './generic';
import type { Role } from './user';
import type { Warehouse } from './warehouse';

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
  warehousesAssigned: Warehouse[];
}

export interface CreateEmployee
  extends Omit<Employee, 'warehousesAssigned' | 'id' | 'role'> {
  warehousesAssigned: number[];
  role: number;
}

export interface EmployeeFilters extends BaseFilters {
  search?: string;
}
