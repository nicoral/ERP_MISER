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
};

// Legacy exports for backward compatibility
export const getCostCenters = costCenterService.getCostCenters;
export const getCostCenter = costCenterService.getCostCenter;
export const createCostCenter = costCenterService.createCostCenter;
export const updateCostCenter = costCenterService.updateCostCenter;
export const deleteCostCenter = costCenterService.deleteCostCenter;
