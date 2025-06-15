export interface Supplier {
  code: string;
  name: string;
  contact: string;
  active: boolean;
}

export interface SupplierFilters {
  code?: string;
  name?: string;
  contact?: string;
}
