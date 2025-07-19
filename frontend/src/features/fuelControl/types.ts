export enum FuelControlStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_SIGNATURE_1 = 'PENDING_SIGNATURE_1',
  PENDING_SIGNATURE_2 = 'PENDING_SIGNATURE_2',
  PENDING_SIGNATURE_3 = 'PENDING_SIGNATURE_3',
  COMPLETED = 'COMPLETED',
}

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
  fuelControlId: number;
  vehicle: string;
  driver: string;
  quantity: number;
  unit: string;
  purpose: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
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

export interface FuelControlFilters {
  status?: FuelControlStatus;
  date?: string;
  responsible?: string;
  search?: string;
}

export interface FuelControlStatistics {
  IN_PROGRESS: number;
  PENDING_SIGNATURE_1: number;
  PENDING_SIGNATURE_2: number;
  PENDING_SIGNATURE_3: number;
  COMPLETED: number;
}
