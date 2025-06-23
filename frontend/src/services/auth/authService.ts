import { STORAGE_KEY_TOKEN, STORAGE_KEY_USER } from '../../config/constants';
import type { User } from '../../types/user';

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
    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.employee));
    sessionStorage.setItem(STORAGE_KEY_TOKEN, data.access_token);
    return data.employee;
  }
  throw new Error(data.message);
}

export function logout() {
  sessionStorage.removeItem(STORAGE_KEY_TOKEN);
  sessionStorage.removeItem(STORAGE_KEY_USER);
}

export function getCurrentUser(): User | null {
  const data = sessionStorage.getItem(STORAGE_KEY_USER);
  return data ? JSON.parse(data) : null;
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/update-password`,
    {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return data;
  }
  throw new Error(data.message);
}

export async function getWarehousesByEmployeeId() {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/me-warehouses`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  const data = await response.json();
  return data;
}
