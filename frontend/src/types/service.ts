import type { Supplier } from './supplier';

export interface Service {
  id: number;
  code: string;
  name: string;
  duration: number;
  durationType: string;
  active: boolean;
  defaultSupplierId?: number;
  defaultSupplier?: Supplier;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceFilters {
  code?: string;
  name?: string;
}
