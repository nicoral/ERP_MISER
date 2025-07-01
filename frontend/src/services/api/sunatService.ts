import { createApiCall } from './httpInterceptor';

export interface SunatExchangeRate {
  date: string;
  saleRate: number;
  purchaseRate: number;
}

export interface SunatSaleRate {
  date: string;
  saleRate: number;
}

const BASE_URL = `${import.meta.env.VITE_API_URL}/sunat`;

export const sunatService = {
  /**
   * Obtiene el tipo de cambio completo desde SUNAT
   * @returns Promise<SunatExchangeRate> - Objeto con fecha, tipo de compra y venta
   */
  async getSunatExchangeRate(): Promise<SunatExchangeRate> {
    const response = await createApiCall<SunatExchangeRate>(
      `${BASE_URL}/exchange-rate`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  /**
   * Obtiene solo la fecha y el tipo de cambio de venta desde SUNAT
   * @returns Promise<SunatSaleRate> - Objeto con fecha y tipo de venta
   */
  async getSunatSaleRate(): Promise<SunatSaleRate> {
    const response = await createApiCall<SunatSaleRate>(
      `${BASE_URL}/sale-rate`,
      {
        method: 'GET',
      }
    );
    return response;
  },
};

// Legacy exports for backward compatibility
export const getSunatExchangeRate = sunatService.getSunatExchangeRate;
export const getSunatSaleRate = sunatService.getSunatSaleRate;
