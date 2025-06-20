import type { Employee } from './employee';

export interface Warehouse {
  id: number;
  name: string;
  address: string;
  hireDate: Date;
  dismissalDate: Date | null;
  active: boolean;
  valued: number;
  manager: Employee;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface WarehouseCreate {
  name: string;
  address: string;
  hireDate: Date;
  dismissalDate: Date | null;
  active: boolean;
  valued: number;
  employeeId: number;
}

export interface WarehouseFilters {
  search?: string;
}
