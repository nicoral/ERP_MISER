import { createApiCall } from './httpInterceptor';
import type {
  GeneralSettings,
  UpdateGeneralSettingsDto,
  ExchangeRate,
  SaleRate,
  ApisNetRUCData,
} from '../../types/generalSettings';

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

    const response = await createApiCall<GeneralSettings>(
      `${BASE_URL}/logo`,
      {
        method: 'POST',
        body: formData,
      },
      false,
      true
    );
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

  async getGeneralTax(): Promise<number> {
    const response = await createApiCall<number>(`${BASE_URL}/general-tax`, {
      method: 'GET',
    });
    return response;
  },

  async getRUCData(ruc: string): Promise<ApisNetRUCData> {
    const response = await createApiCall<ApisNetRUCData>(
      `${BASE_URL}/ruc-data?ruc=${ruc}`,
      {
        method: 'GET',
      }
    );
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
export const getGeneralTax = generalSettingsService.getGeneralTax;
export const getRUCData = generalSettingsService.getRUCData;
