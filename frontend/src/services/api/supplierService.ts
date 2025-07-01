import { createApiCall } from './httpInterceptor';
import type { PaginatedResponse } from '../../types/generic';
import type { Supplier, SupplierFilters } from '../../types/supplier';

const BASE_URL = `${import.meta.env.VITE_API_URL}/suppliers`;

export const supplierService = {
  async getSuppliers(
    page: number = 1,
    pageSize: number = 10,
    filters?: SupplierFilters
  ): Promise<PaginatedResponse<Supplier>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', pageSize.toString());
    if (filters?.name) {
      queryParams.append('name', filters.name);
    }

    const response = await createApiCall<{
      data: Supplier[];
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

  async getSupplier(id: number): Promise<Supplier> {
    const response = await createApiCall<Supplier>(`${BASE_URL}/${id}`, {
      method: 'GET',
    });
    return response;
  },

  async createSupplier(supplier: Supplier): Promise<Supplier> {
    const response = await createApiCall<Supplier>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
    return response;
  },

  async updateSupplier(
    id: number,
    supplier: Omit<Supplier, 'id'>
  ): Promise<Supplier> {
    const response = await createApiCall<Supplier>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    });
    return response;
  },

  async deleteSupplier(id: number): Promise<void> {
    const response = await createApiCall<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};

// Legacy exports for backward compatibility
export const getSuppliers = supplierService.getSuppliers;
export const getSupplier = supplierService.getSupplier;
export const createSupplier = supplierService.createSupplier;
export const updateSupplier = supplierService.updateSupplier;
export const deleteSupplier = supplierService.deleteSupplier;
