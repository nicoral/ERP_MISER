import { createApiCall } from './httpInterceptor';
import type {
  FuelDailyControl,
  FuelOutput,
  FuelStockMovement,
  CreateFuelDailyControlDto,
  UpdateFuelDailyControlDto,
  CreateFuelOutputDto,
  UpdateFuelOutputDto,
  FuelControlFilters,
} from '../../features/fuelControl/types';

const BASE_URL = `${import.meta.env.VITE_API_URL}/fuel-control`;

export const fuelControlService = {
  // Fuel Daily Control Methods
  async getFuelDailyControls(
    page: number = 1,
    pageSize: number = 10,
    filters?: FuelControlFilters
  ): Promise<{
    data: FuelDailyControl[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', pageSize.toString());

    if (filters?.warehouseId) {
      queryParams.append('warehouseId', filters.warehouseId.toString());
    }
    if (filters?.status) {
      queryParams.append('status', filters.status);
    }
    if (filters?.date) {
      queryParams.append('date', filters.date);
    }

    const response = await createApiCall<{
      data: FuelDailyControl[];
      total: number;
    }>(`${BASE_URL}/daily-control?${queryParams.toString()}`, {
      method: 'GET',
    });

    return {
      data: response.data,
      total: response.total,
      page,
      pageSize,
      totalPages: Math.ceil(response.total / pageSize),
    };
  },

  async getFuelDailyControl(id: number): Promise<FuelDailyControl | null> {
    try {
      const response = await createApiCall<FuelDailyControl>(
        `${BASE_URL}/daily-control/${id}`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Error fetching fuel daily control:', error);
      return null;
    }
  },

  async createFuelDailyControl(
    data: CreateFuelDailyControlDto
  ): Promise<FuelDailyControl> {
    const response = await createApiCall<FuelDailyControl>(
      `${BASE_URL}/daily-control`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async closeFuelDailyControl(
    id: number,
    data: UpdateFuelDailyControlDto
  ): Promise<FuelDailyControl> {
    const response = await createApiCall<FuelDailyControl>(
      `${BASE_URL}/daily-control/${id}/close`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async signFuelDailyControl(id: number): Promise<FuelDailyControl> {
    const response = await createApiCall<FuelDailyControl>(
      `${BASE_URL}/daily-control/${id}/sign`,
      {
        method: 'POST',
      }
    );
    return response;
  },

  // Fuel Output Methods
  async getFuelOutputs(fuelDailyControlId: number): Promise<FuelOutput[]> {
    try {
      const response = await createApiCall<FuelOutput[]>(
        `${BASE_URL}/outputs?fuelDailyControlId=${fuelDailyControlId}`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Error fetching fuel outputs:', error);
      return [];
    }
  },

  async getFuelOutput(id: number): Promise<FuelOutput | null> {
    try {
      const response = await createApiCall<FuelOutput>(
        `${BASE_URL}/output/${id}`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Error fetching fuel output:', error);
      return null;
    }
  },

  async createFuelOutput(data: CreateFuelOutputDto): Promise<FuelOutput> {
    const response = await createApiCall<FuelOutput>(`${BASE_URL}/output`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  async updateFuelOutput(
    id: number,
    data: UpdateFuelOutputDto
  ): Promise<FuelOutput> {
    const response = await createApiCall<FuelOutput>(
      `${BASE_URL}/output/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async updateImage(id: number, file: File): Promise<FuelOutput> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await createApiCall<FuelOutput>(
      `${BASE_URL}/output/${id}/image`,
      {
        method: 'POST',
        body: formData,
      },
      false,
      true
    );
    return response;
  },

  async signFuelOutput(id: number): Promise<FuelOutput> {
    const response = await createApiCall<FuelOutput>(
      `${BASE_URL}/output/${id}/sign`,
      {
        method: 'POST',
      }
    );
    return response;
  },

  // Stock Movement Methods
  async getStockMovements(
    warehouseId?: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    data: FuelStockMovement[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', pageSize.toString());

    if (warehouseId) {
      queryParams.append('warehouseId', warehouseId.toString());
    }

    const response = await createApiCall<{
      data: FuelStockMovement[];
      total: number;
    }>(`${BASE_URL}/stock-movements?${queryParams.toString()}`, {
      method: 'GET',
    });

    return {
      data: response.data,
      total: response.total,
      page,
      pageSize,
      totalPages: Math.ceil(response.total / pageSize),
    };
  },
};

// Legacy exports for backward compatibility
export const getFuelDailyControls = fuelControlService.getFuelDailyControls;
export const getFuelDailyControl = fuelControlService.getFuelDailyControl;
export const createFuelDailyControl = fuelControlService.createFuelDailyControl;
export const closeFuelDailyControl = fuelControlService.closeFuelDailyControl;
export const signFuelDailyControl = fuelControlService.signFuelDailyControl;
export const getFuelOutputs = fuelControlService.getFuelOutputs;
export const getFuelOutput = fuelControlService.getFuelOutput;
export const createFuelOutput = fuelControlService.createFuelOutput;
export const updateFuelOutput = fuelControlService.updateFuelOutput;
export const updateImage = fuelControlService.updateImage;
export const signFuelOutput = fuelControlService.signFuelOutput;
export const getStockMovements = fuelControlService.getStockMovements;
