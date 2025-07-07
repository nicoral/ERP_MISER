import { STORAGE_KEY_TOKEN, STORAGE_KEY_USER } from '../../config/constants';
import type { Employee } from '../../types/employee';
import type { User } from '../../types/user';
import { createApiCall } from '../api/httpInterceptor';
import type { ProfileData } from '../../features/auth/hooks/useProfile';
import type { Warehouse } from '../../types/warehouse';

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (response.status === 201) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.employee));
    localStorage.setItem(STORAGE_KEY_TOKEN, data.access_token);
    return data.employee;
  }
  throw new Error(data.message);
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEY_USER);
  return data ? JSON.parse(data) : null;
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
) {
  const response = await createApiCall(
    `${import.meta.env.VITE_API_URL}/auth/update-password`,
    {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }
  );
  return response;
}

export async function getWarehousesByEmployeeId() {
  const response = await createApiCall<Warehouse[]>(
    `${import.meta.env.VITE_API_URL}/auth/me-warehouses`,
    {
      method: 'GET',
    }
  );

  return response;
}

export const uploadEmployeeSignature = async (
  file: File
): Promise<Employee> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await createApiCall<Employee>(
    `${import.meta.env.VITE_API_URL}/auth/update-signature`,
    {
      method: 'PUT',
      body: formData,
    },
    false,
    true
  );
  return response;
};

export async function getProfile() {
  const response = await createApiCall<ProfileData>(
    `${import.meta.env.VITE_API_URL}/auth/profile/me`,
    {
      method: 'GET',
    }
  );

  return response;
}
