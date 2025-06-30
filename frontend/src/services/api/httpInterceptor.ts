import type { NavigateFunction } from 'react-router-dom';
import { STORAGE_KEY_TOKEN } from '../../config/constants';

let navigate: NavigateFunction | null = null;

export const setNavigate = (nav: NavigateFunction) => {
  navigate = nav;
};

export const handleApiError = (error: { response?: { status: number } }) => {
  console.log('handleApiError called with:', error);

  if (error.response?.status === 403) {
    console.log('Handling 403 error - redirecting to unauthorized');
    if (navigate) {
      navigate('/unauthorized');
    } else {
      // Fallback si navigate no está disponible
      window.location.href = '/unauthorized';
    }
    return;
  }

  // Para otros errores, puedes manejarlos aquí
  if (error.response?.status === 401) {
    console.log('Handling 401 error - redirecting to login');
    // Token expirado o inválido
    localStorage.removeItem('token');
    if (navigate) {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
    return;
  }

  // Solo re-lanzar el error si no fue manejado específicamente
  console.log('Re-throwing unhandled error:', error);
  throw error;
};

export const createApiCall = async <T>(
  url: string,
  options: RequestInit = {},
  isBlob: boolean = false
): Promise<T> => {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(!isBlob ? { 'Content-Type': 'application/json' } : {}),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    if (response.status >= 400) {
      const error = await response.json();
      throw error.message || null;
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
    handleApiError(error as { response?: { status: number } });
    throw error;
  }
};
