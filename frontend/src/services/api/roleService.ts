import { STORAGE_KEY_TOKEN } from '../../config/constants';
import type { Role } from '../../types/user';

export const getRoles = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/roles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
    },
  });
  const data = await response.json();
  if (response.status === 200) {
    return data as Role[];
  }
  throw new Error('Error al obtener los roles');
};

export const getRoleById = async (id: number) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/roles/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
    },
  });
  const data = await response.json();
  if (response.status === 200) {
    return data as Role;
  }
  throw new Error('Error al obtener el rol');
};
