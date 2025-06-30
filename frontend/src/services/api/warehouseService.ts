import { STORAGE_KEY_TOKEN } from '../../config/constants';
import type {
  Warehouse,
  WarehouseCreate,
  WarehouseFilters,
} from '../../types/warehouse';

export async function getWarehouses(
  page: number = 1,
  pageSize: number = 10,
  filters?: WarehouseFilters
): Promise<{
  data: Warehouse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', pageSize.toString());

  if (filters?.search) {
    queryParams.append('search', filters.search);
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/warehouses?${queryParams.toString()}`,
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
    return {
      data: data.data,
      total: data.total,
      page: data.page,
      pageSize: data.limit,
      totalPages: Math.ceil(data.total / data.limit),
    };
  }

  throw new Error(data.message);
}

export async function getWarehouseById(
  id: number | undefined
): Promise<Warehouse | null> {
  if (!id) {
    return null;
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/warehouses/${id}`,
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
    return data;
  }

  throw new Error(data.message);
}

export async function createWarehouse(
  warehouse: WarehouseCreate
): Promise<Warehouse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/warehouses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
    },
    body: JSON.stringify(warehouse),
  });

  const data = await response.json();

  if (response.status === 201) {
    return data;
  }

  throw new Error(data.message);
}

export async function updateWarehouse(
  id: number,
  warehouse: Partial<WarehouseCreate>
): Promise<Warehouse> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/warehouses/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: JSON.stringify(warehouse),
    }
  );

  const data = await response.json();

  if (response.status === 200) {
    return data;
  }

  throw new Error(data.message);
}

export async function deleteWarehouse(id: number): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/warehouses/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (response.status !== 204) {
    const data = await response.json();
    throw new Error(data.message);
  }
}
