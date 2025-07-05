import { createApiCall } from './httpInterceptor';
import type { Service } from '../../types/service';
import type { PaginatedResponse } from '../../types/generic';

const BASE_URL = `${import.meta.env.VITE_API_URL}/services`;

export const serviceService = {
  async getServices(
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ): Promise<PaginatedResponse<Service>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', pageSize.toString());
    if (search) {
      queryParams.append('search', search);
    }

    const response = await createApiCall<{
      data: Service[];
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

  async getService(id: number | undefined): Promise<Service | null> {
    if (!id) {
      return null;
    }

    const response = await createApiCall<Service>(`${BASE_URL}/${id}`, {
      method: 'GET',
    });
    return response;
  },

  async createService(service: Partial<Service>): Promise<Service> {
    const response = await createApiCall<Service>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(service),
    });
    return response;
  },

  async updateService(id: number, service: Partial<Service>): Promise<Service> {
    const response = await createApiCall<Service>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    });
    return response;
  },

  async deleteService(id: number): Promise<void> {
    const response = await createApiCall<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};

// Legacy exports for backward compatibility
export const getServices = serviceService.getServices;
export const getService = serviceService.getService;
export const createService = serviceService.createService;
export const updateService = serviceService.updateService;
export const deleteService = serviceService.deleteService;
