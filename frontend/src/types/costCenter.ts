export interface CostCenter {
  id: number;
  description: string;
  code?: string;
  serial?: string;
  codeMine?: string;
  parent?: CostCenter;
  children?: CostCenter[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateCostCenter {
  description: string;
  code?: string;
  serial?: string;
  codeMine?: string;
  children?: CreateCostCenter[];
}

export interface UpdateCostCenter {
  description?: string;
  code?: string;
  serial?: string;
  codeMine?: string;
  children?: UpdateCostCenterChildren[];
}

export interface UpdateCostCenterChildren {
  id?: number;
  description?: string;
  code?: string;
  serial?: string;
  codeMine?: string;
}
