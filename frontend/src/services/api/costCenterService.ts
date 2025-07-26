import { createApiCall } from './httpInterceptor';
import type {
  CostCenter,
  CreateCostCenter,
  UpdateCostCenter,
} from '../../types/costCenter';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/cost-centers`;

export const costCenterService = {
  async getCostCenters(
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ): Promise<PaginatedResponse<CostCenter>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', pageSize.toString());
    if (search) {
      queryParams.append('search', search);
    }

    const response = await createApiCall<{
      data: CostCenter[];
      total: number;
      page: number;
      limit: number;
    }>(`${BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
    });

    return {
      data: response.data,
      total: response.total,
      page: response.page,
      pageSize: response.limit,
      totalPages: Math.ceil(response.total / response.limit),
    };
  },

  async getCostCentersSimple(): Promise<CostCenter[]> {
    const response = await createApiCall<CostCenter[]>(
      `${BASE_URL}/list/simple`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async getCostCenter(id: number): Promise<CostCenter> {
    const response = await createApiCall<CostCenter>(`${BASE_URL}/${id}`, {
      method: 'GET',
    });
    return response;
  },

  async createCostCenter(costCenter: CreateCostCenter): Promise<CostCenter> {
    const response = await createApiCall<CostCenter>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(costCenter),
    });
    return response;
  },

  async updateCostCenter(
    id: number,
    costCenter: UpdateCostCenter
  ): Promise<CostCenter> {
    const response = await createApiCall<CostCenter>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(costCenter),
    });
    return response;
  },

  async deleteCostCenter(id: number): Promise<void> {
    const response = await createApiCall<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  async importFromExcel(file: File): Promise<{
    success: number;
    errors: Array<{ row: number; error: string }>;
    total: number;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await createApiCall<{
      success: number;
      errors: Array<{ row: number; error: string }>;
      total: number;
      message: string;
    }>(
      `${BASE_URL}/excel/import`,
      {
        method: 'POST',
        body: formData,
      },
      false,
      true
    );
    return response;
  },

  async downloadTemplate(): Promise<Blob> {
    const response = await createApiCall<Blob>(
      `${import.meta.env.VITE_API_URL}/cost-centers/excel/template`,
      {
        method: 'GET',
      },
      true
    );

    return response;
  },
};

// Legacy exports for backward compatibility
export const getCostCenters = costCenterService.getCostCenters;
export const getCostCenter = costCenterService.getCostCenter;
export const getCostCentersSimple = costCenterService.getCostCentersSimple;
export const createCostCenter = costCenterService.createCostCenter;
export const updateCostCenter = costCenterService.updateCostCenter;
export const deleteCostCenter = costCenterService.deleteCostCenter;
