import { createApiCall } from './httpInterceptor';
import type {
  Warehouse,
  WarehouseCreate,
  WarehouseFilters,
  WarehouseFuelStockUpdate,
  WarehouseFuelStock,
} from '../../types/warehouse';

const BASE_URL = `${import.meta.env.VITE_API_URL}/warehouses`;

export const warehouseService = {
  async getWarehouses(
    page: number = 1,
    pageSize: number = 10,
    filters?: WarehouseFilters
  ): Promise<{
    data: Warehouse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', pageSize.toString());

    if (filters?.search) {
      queryParams.append('search', filters.search);
    }

    const response = await createApiCall<{
      data: Warehouse[];
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

  async getWarehouseById(id: number | undefined): Promise<Warehouse | null> {
    if (!id) {
      return null;
    }

    const response = await createApiCall<Warehouse>(`${BASE_URL}/${id}`, {
      method: 'GET',
    });
    return response;
  },

  async createWarehouse(warehouse: WarehouseCreate): Promise<Warehouse> {
    const response = await createApiCall<Warehouse>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(warehouse),
    });
    return response;
  },

  async updateWarehouse(
    id: number,
    warehouse: Partial<WarehouseCreate>
  ): Promise<Warehouse> {
    const response = await createApiCall<Warehouse>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(warehouse),
    });
    return response;
  },

  async deleteWarehouse(id: number): Promise<void> {
    const response = await createApiCall<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  // Fuel Stock Methods
  async updateWarehouseFuelStock(
    warehouseId: number,
    updateData: WarehouseFuelStockUpdate
  ): Promise<WarehouseFuelStock> {
    const response = await createApiCall<WarehouseFuelStock>(
      `${BASE_URL}/fuel-stock/${warehouseId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    );
    return response;
  },

  async configureWarehouseFuelStock(
    warehouseId: number,
    configData: WarehouseFuelStockUpdate
  ): Promise<WarehouseFuelStock> {
    const response = await createApiCall<WarehouseFuelStock>(
      `${BASE_URL}/fuel-stock/${warehouseId}/configure`,
      {
        method: 'POST',
        body: JSON.stringify(configData),
      }
    );
    return response;
  },
};

// Legacy exports for backward compatibility
export const getWarehouses = warehouseService.getWarehouses;
export const getWarehouseById = warehouseService.getWarehouseById;
export const createWarehouse = warehouseService.createWarehouse;
export const updateWarehouse = warehouseService.updateWarehouse;
export const deleteWarehouse = warehouseService.deleteWarehouse;
export const updateWarehouseFuelStock =
  warehouseService.updateWarehouseFuelStock;
export const configureWarehouseFuelStock =
  warehouseService.configureWarehouseFuelStock;
