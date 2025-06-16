import { STORAGE_KEY_TOKEN } from '../../config/constants';
import type { PaginatedResponse } from '../../types/generic';
import type { Supplier, SupplierFilters } from '../../types/supplier';

export async function getSuppliers(
  page: number = 1,
  pageSize: number = 10,
  filters?: SupplierFilters
): Promise<PaginatedResponse<Supplier>> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', pageSize.toString());
  if (filters?.name) {
    queryParams.append('name', filters.name);
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/suppliers?${queryParams.toString()}`,
    {
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

export async function getSupplier(id: number): Promise<Supplier> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/suppliers/${id}`,
    {
      headers: {
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

export async function createSupplier(supplier: Supplier): Promise<Supplier> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/suppliers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
    },
    body: JSON.stringify(supplier),
  });
  const data = await response.json();
  if (response.status === 201) {
    return data;
  }
  throw new Error(data.message);
}

export async function updateSupplier(
  id: number,
  supplier: Omit<Supplier, 'id'>
): Promise<Supplier> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/suppliers/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: JSON.stringify(supplier),
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return data;
  }
  throw new Error(data.message);
}
