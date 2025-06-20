import { STORAGE_KEY_TOKEN } from '../../config/constants';
import type {
  CostCenter,
  CreateCostCenter,
  UpdateCostCenter,
} from '../../types/costCenter';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getCostCenters(
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<PaginatedResponse<CostCenter>> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', pageSize.toString());
  if (search) {
    queryParams.append('search', search);
  }
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cost-centers?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
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
  throw new Error('Failed to fetch cost centers');
}

export async function getCostCenter(id: number): Promise<CostCenter> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cost-centers/${id}`,
    {
      method: 'GET',
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
  throw new Error('Failed to fetch cost center');
}

export async function createCostCenter(
  costCenter: CreateCostCenter
): Promise<CostCenter> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/cost-centers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
    },
    body: JSON.stringify(costCenter),
  });
  const data = await response.json();
  if (response.status === 201) {
    return data;
  }
  throw new Error('Failed to create cost center');
}

export async function updateCostCenter(
  id: number,
  costCenter: UpdateCostCenter
): Promise<CostCenter> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cost-centers/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: JSON.stringify(costCenter),
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return data;
  }
  throw new Error('Failed to update cost center');
}

export async function deleteCostCenter(id: number): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/cost-centers/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (response.status !== 200) {
    const data = await response.json();
    throw new Error(data.message || 'Error al eliminar el centro de costo');
  }
}
