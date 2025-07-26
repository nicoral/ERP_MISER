import type { Employee } from '../../types/employee';
import type { CostCenter } from '../../types/costCenter';
import type { Warehouse } from '../../types/warehouse';

export enum FuelControlStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_SIGNATURE_1 = 'PENDING_SIGNATURE_1',
  PENDING_SIGNATURE_2 = 'PENDING_SIGNATURE_2',
  PENDING_SIGNATURE_3 = 'PENDING_SIGNATURE_3',
  COMPLETED = 'COMPLETED',
}

export enum FuelDailyControlStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  SIGNED_1 = 'SIGNED_1',
  SIGNED_2 = 'SIGNED_2',
  SIGNED_3 = 'SIGNED_3',
  FINALIZED = 'FINALIZED',
  CANCELLED = 'CANCELLED',
}

export enum FuelOutputStatus {
  PENDING = 'PENDING',
  SIGNED = 'SIGNED',
  CANCELLED = 'CANCELLED',
}

export enum FuelMovementType {
  OPENING = 'OPENING',
  OUTPUT = 'OUTPUT',
  ADJUSTMENT = 'ADJUSTMENT',
  CLOSING = 'CLOSING',
}

// Legacy interfaces for backward compatibility
export interface FuelControl {
  id: number;
  date: string;
  responsible: string;
  status: FuelControlStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FuelOutput {
  id: number;
  fuelDailyControlId: number;
  quantity: number;
  hourMeter: number;
  costCenterId: number;
  costCenter?: CostCenter;
  operatorEmployeeId: number;
  operatorEmployee?: Employee;
  outputTime: string;
  status: FuelOutputStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FuelInput {
  id: number;
  fuelControlId: number;
  purchaseOrder: string;
  supplier: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelSupply {
  id: number;
  fuelControlId: number;
  operatorId: number;
  operatorName: string;
  hourmeter: number;
  gallons: number;
  photoUrl: string;
  costCenterId: number;
  costCenterName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFuelSupply {
  fuelControlId: number;
  operatorId: number;
  hourmeter: number;
  gallons: number;
  photoUrl?: string;
  costCenterId: number;
}

// New interfaces for backend integration
export interface FuelDailyControl {
  id: number;
  warehouse: Warehouse;
  controlDate: Date;
  status: FuelDailyControlStatus;
  openingStock: number;
  closingStock: number | null;
  totalOutputs: number;
  observations: string | null;
  fuelOutputs: FuelOutput[];
  // ApprovalFlowBase fields
  firstSignature: string | null;
  firstSignedBy: number | null;
  firstSignedAt: Date | null;
  secondSignature: string | null;
  secondSignedBy: number | null;
  secondSignedAt: Date | null;
  thirdSignature: string | null;
  thirdSignedBy: number | null;
  thirdSignedAt: Date | null;
  fourthSignature: string | null;
  fourthSignedBy: number | null;
  fourthSignedAt: Date | null;
  rejectedReason: string | null;
  rejectedBy: number | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FuelStockMovement {
  id: number;
  warehouse: Warehouse;
  movementType: FuelMovementType;
  stockBefore: number;
  stockAfter: number;
  employee: Employee;
  observations: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs for API calls
export interface CreateFuelDailyControlDto {
  warehouseId: number;
  observations?: string;
}

export interface UpdateFuelDailyControlDto {
  closingStock?: number;
  observations?: string;
}

export interface CreateFuelOutputDto {
  fuelDailyControlId: number;
  quantity: number;
  hourMeter: number;
  costCenterId: number;
  operatorEmployeeId: number;
}

export interface UpdateFuelOutputDto {
  quantity?: number;
  vehiclePlate?: string;
  equipmentCode?: string;
  destination?: string;
  observations?: string;
  operatorEmployeeId?: number;
  outputTime?: Date;
}

export interface FuelControlFilters {
  warehouseId?: number;
  status?: FuelControlStatus | FuelDailyControlStatus;
  date?: string;
  search?: string;
  responsible?: string;
}

export interface FuelControlStatistics {
  IN_PROGRESS: number;
  PENDING_SIGNATURE_1: number;
  PENDING_SIGNATURE_2: number;
  PENDING_SIGNATURE_3: number;
  COMPLETED: number;
}

export interface FuelDailyControlStatistics {
  OPEN: number;
  CLOSED: number;
  SIGNED_1: number;
  SIGNED_2: number;
  SIGNED_3: number;
  FINALIZED: number;
  CANCELLED: number;
}
