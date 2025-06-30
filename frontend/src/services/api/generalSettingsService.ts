import { STORAGE_KEY_TOKEN } from '../../config/constants';

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

/**
 * Obtiene las configuraciones generales del sistema
 */
export const getGeneralSettings = async (): Promise<GeneralSettings> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/general-settings`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || 'Error al obtener las configuraciones generales'
    );
  }

  return response.json();
};

/**
 * Actualiza las configuraciones generales
 */
export const updateGeneralSettings = async (
  updateData: UpdateGeneralSettingsDto
): Promise<GeneralSettings> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/general-settings`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: JSON.stringify(updateData),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || 'Error al actualizar las configuraciones generales'
    );
  }

  return response.json();
};

/**
 * Sube el logo de la empresa
 */
export const uploadLogo = async (file: File): Promise<GeneralSettings> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/general-settings/logo`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al subir el logo');
  }

  return response.json();
};

/**
 * Obtiene el tipo de cambio actual
 */
export const getCurrentExchangeRate = async (): Promise<ExchangeRate> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/general-settings/exchange-rate`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener el tipo de cambio');
  }

  return response.json();
};

/**
 * Obtiene solo el tipo de cambio de venta actual
 */
export const getCurrentSaleRate = async (): Promise<SaleRate> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/general-settings/exchange-rate/sale`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || 'Error al obtener el tipo de cambio de venta'
    );
  }

  return response.json();
};

/**
 * Actualiza manualmente el tipo de cambio
 */
export const updateExchangeRate = async (): Promise<GeneralSettings> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/general-settings/exchange-rate/update`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar el tipo de cambio');
  }

  return response.json();
};

/**
 * Verifica si el tipo de cambio necesita actualización
 */
export const shouldUpdateExchangeRate = async (): Promise<{
  shouldUpdate: boolean;
}> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/general-settings/exchange-rate/should-update`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || 'Error al verificar el estado del tipo de cambio'
    );
  }

  return response.json();
};
