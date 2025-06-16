export interface CostCenter {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCostCenter {
  name: string;
  description?: string;
}

export interface UpdateCostCenter {
  name?: string;
  description?: string;
}
