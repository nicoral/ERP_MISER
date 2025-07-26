import type { Employee } from './employee';

export interface WarehouseFuelStock {
  id: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  tankCapacity: number;
  warehouse: Warehouse;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: number;
  name: string;
  address: string;
  hireDate: Date;
  dismissalDate: Date | null;
  active: boolean;
  valued: number;
  manager: Employee;
  warehouseFuelStock?: WarehouseFuelStock;
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

export interface WarehouseFuelStockUpdate {
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  tankCapacity?: number;
}
