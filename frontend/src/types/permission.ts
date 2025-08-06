export interface Permission {
  id: number;
  name: string;
  module?: string;
  endpoint?: string;
  method?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
} 