export interface ImportCostCenterRowDto {
  id?: number; // ID específico para el centro de costo
  description: string;
  code?: string;
  serial?: string;
  codeMine?: string;
  model?: string;
  brand?: string;
  licensePlate?: string;
  owner?: string;
  parentCode?: string; // Código del equipo padre (opcional)
}

export interface ImportCostCenterResult {
  success: number;
  errors: Array<{ row: number; error: string }>;
  total: number;
}
