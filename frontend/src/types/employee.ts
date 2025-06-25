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
  signature?: string;
  hireDate: Date;
  dischargeDate: Date | null;
  birthDate: Date | null;
  area: string | null;
  role: Role;
  active: boolean;
  warehousesAssigned: Warehouse[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface CreateEmployee
  extends Omit<Employee, 'warehousesAssigned' | 'id' | 'role'> {
  warehousesAssigned: number[];
  role: number;
}

export type UpdateEmployee = Partial<
  Omit<Employee, 'id' | 'role' | 'password' | 'warehousesAssigned'>
> & {
  warehousesAssigned?: number[];
};

export interface EmployeeFilters extends BaseFilters {
  search?: string;
}
