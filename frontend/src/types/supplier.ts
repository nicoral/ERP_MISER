export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLACKLISTED = 'BLACK_LIST',
}

export interface Supplier {
  id: number;
  ruc: string;
  businessName: string;
  address?: string;
  contactPerson: string;
  mobile: string;
  email?: string;
  bankAccount?: string;
  returnPolicy: boolean;
  rating: number;
  status: SupplierStatus;
  lines: string;
}

export interface SupplierFilters {
  code?: string;
  name?: string;
  contact?: string;
}
