export interface Service {
  code: string;
  name: string;
  type: string;
  active: boolean;
}

export interface ServiceFilters {
  code?: string;
  name?: string;
  type?: string;
}
