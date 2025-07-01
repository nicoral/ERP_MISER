import { createApiCall } from './httpInterceptor';

export interface GeneralSettings {
  id: number;
  companyName: string;
  companyLogoUrl: string | null;
  exchangeRateSale: string | null;
  exchangeRatePurchase: string | null;
  exchangeRateDate: string | null;
  exchangeRateDateString: string | null;
  exchangeRateAutoUpdate: boolean;
  timezone: string;
  additionalSettings: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateGeneralSettingsDto {
  companyName?: string;
  companyLogoUrl?: string;
  exchangeRateSale?: number;
  exchangeRatePurchase?: number;
  exchangeRateDateString?: string;
  exchangeRateAutoUpdate?: boolean;
  timezone?: string;
  additionalSettings?: string;
}

export interface ExchangeRate {
  date: string;
  saleRate: number;
  purchaseRate: number;
}

export interface SaleRate {
  date: string;
  saleRate: number;
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/general-settings`;

export const generalSettingsService = {
  /**
   * Obtiene las configuraciones generales del sistema
   */
  async getGeneralSettings(): Promise<GeneralSettings> {
    const response = await createApiCall<GeneralSettings>(BASE_URL, {
      method: 'GET',
    });
    return response;
  },

  /**
   * Actualiza las configuraciones generales
   */
  async updateGeneralSettings(
    updateData: UpdateGeneralSettingsDto
  ): Promise<GeneralSettings> {
    const response = await createApiCall<GeneralSettings>(BASE_URL, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response;
  },

  /**
   * Sube el logo de la empresa
   */
  async uploadLogo(file: File): Promise<GeneralSettings> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await createApiCall<GeneralSettings>(`${BASE_URL}/logo`, {
      method: 'POST',
      body: formData,
    });
    return response;
  },

  /**
   * Obtiene el tipo de cambio actual
   */
  async getCurrentExchangeRate(): Promise<ExchangeRate> {
    const response = await createApiCall<ExchangeRate>(
      `${BASE_URL}/exchange-rate`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  /**
   * Obtiene solo el tipo de cambio de venta actual
   */
  async getCurrentSaleRate(): Promise<SaleRate> {
    const response = await createApiCall<SaleRate>(
      `${BASE_URL}/exchange-rate/sale`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  /**
   * Actualiza manualmente el tipo de cambio
   */
  async updateExchangeRate(): Promise<GeneralSettings> {
    const response = await createApiCall<GeneralSettings>(
      `${BASE_URL}/exchange-rate/update`,
      {
        method: 'POST',
      }
    );
    return response;
  },

  /**
   * Verifica si el tipo de cambio necesita actualización
   */
  async shouldUpdateExchangeRate(): Promise<{
    shouldUpdate: boolean;
  }> {
    const response = await createApiCall<{
      shouldUpdate: boolean;
    }>(`${BASE_URL}/exchange-rate/should-update`, {
      method: 'GET',
    });
    return response;
  },
};

// Legacy exports for backward compatibility
export const getGeneralSettings = generalSettingsService.getGeneralSettings;
export const updateGeneralSettings =
  generalSettingsService.updateGeneralSettings;
export const uploadLogo = generalSettingsService.uploadLogo;
export const getCurrentExchangeRate =
  generalSettingsService.getCurrentExchangeRate;
export const getCurrentSaleRate = generalSettingsService.getCurrentSaleRate;
export const updateExchangeRate = generalSettingsService.updateExchangeRate;
export const shouldUpdateExchangeRate =
  generalSettingsService.shouldUpdateExchangeRate;
