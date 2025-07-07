import type { NavigateFunction } from 'react-router-dom';
import { ROUTES, STORAGE_KEY_TOKEN } from '../../config/constants';
import { logout } from '../auth/authService';

let navigate: NavigateFunction | null = null;
let onLogout: (() => void) | null = null;

export const setNavigate = (nav: NavigateFunction) => {
  navigate = nav;
};

export const setOnLogout = (callback: () => void) => {
  onLogout = callback;
};

export const handleApiError = (error: { response?: { status: number } }) => {
  console.log('handleApiError called with:', error);

  if (error.response?.status === 401) {
    console.log('Handling 401 error - redirecting to login');
    if (navigate) {
      navigate(ROUTES.LOGIN);
    } else {
      window.location.href = ROUTES.LOGIN;
    }
    logout();
    if (onLogout) {
      onLogout();
    }
    return;
  }

  if (error.response?.status === 403) {
    console.log('Handling 403 error - redirecting to unauthorized');
    if (navigate) {
      navigate(ROUTES.UNAUTHORIZED);
    } else {
      // Fallback si navigate no está disponible
      window.location.href = ROUTES.UNAUTHORIZED;
    }
    return;
  }

  // Re-throw the error so it can be caught by the calling component
  throw error;
};

export const createApiCall = async <T>(
  url: string,
  options: RequestInit = {},
  isBlob: boolean = false,
  isFormData: boolean = false
): Promise<T> => {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(!isBlob && !isFormData
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (response.status >= 400) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Unknown error' };
      }

      const error = new Error(errorData.message || 'API Error');
      (error as { response?: { status: number } }).response = {
        status: response.status,
      };

      // Solo manejar errores 401 y 403 específicamente
      if (response.status === 401 || response.status === 403) {
        handleApiError(error as { response?: { status: number } });
      }

      throw error;
    }

    if (isBlob) {
      return response.blob() as T;
    }

    let data;
    if (options.method !== 'DELETE') {
      data = await response.json();
    } else {
      data = { success: true };
    }

    return data;
  } catch (error) {
    console.error('API Call Error:', error);

    // Si el error ya tiene la estructura correcta, usarlo directamente
    if ((error as { response?: { status: number } }).response?.status) {
      handleApiError(error as { response?: { status: number } });
    }

    // Always re-throw the error so it can be caught by the calling component
    throw error;
  }
};
