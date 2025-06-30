import { STORAGE_KEY_TOKEN } from '../../config/constants';
import type { Permission } from '../../types/user';

export const getPermissions = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/permissions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
    },
  });
  const data = await response.json();
  return data as Permission[];
};

export const getPermissionsByRole = async (roleId: number | null) => {
  if (!roleId) return [];
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/roles/${roleId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return data.permissions as Permission[];
  }
  throw new Error(data.message);
};
