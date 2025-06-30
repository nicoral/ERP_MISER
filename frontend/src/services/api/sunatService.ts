import { STORAGE_KEY_TOKEN } from '../../config/constants';

export interface SunatExchangeRate {
  date: string;
  saleRate: number;
  purchaseRate: number;
}

export interface SunatSaleRate {
  date: string;
  saleRate: number;
}

/**
 * Obtiene el tipo de cambio completo desde SUNAT
 * @returns Promise<SunatExchangeRate> - Objeto con fecha, tipo de compra y venta
 */
export const getSunatExchangeRate = async (): Promise<SunatExchangeRate> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/sunat/exchange-rate`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (response.status === 200) {
    return response.json();
  }

  const error = await response.json();
  throw new Error(
    error.message || 'Error al obtener el tipo de cambio de SUNAT'
  );
};

/**
 * Obtiene solo la fecha y el tipo de cambio de venta desde SUNAT
 * @returns Promise<SunatSaleRate> - Objeto con fecha y tipo de venta
 */
export const getSunatSaleRate = async (): Promise<SunatSaleRate> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/sunat/sale-rate`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (response.status === 200) {
    return response.json();
  }

  const error = await response.json();
  throw new Error(
    error.message || 'Error al obtener el tipo de cambio de venta de SUNAT'
  );
};
