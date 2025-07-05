export interface Service {
  id: number;
  code: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceFilters {
  code?: string;
  name?: string;
}
