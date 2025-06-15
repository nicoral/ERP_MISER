import { STORAGE_KEY_TOKEN } from '../../config/constants';
import type {
  CreateEmployee,
  Employee,
  EmployeeFilters,
} from '../../types/employee';
import type { PaginatedResponse } from '../../types/generic';

export const getEmployee = async (
  id: number
): Promise<Employee | undefined> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/employees/${id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );
  const data = await response.json();
  return data;
};

export async function getEmployees(
  page: number = 1,
  pageSize: number = 10,
  filters?: EmployeeFilters
): Promise<PaginatedResponse<Employee>> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', pageSize.toString());
  if (filters?.search) {
    queryParams.append('search', filters.search);
  }
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/employees?${queryParams.toString()}`,
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
  throw new Error(data.message);
}

export const createEmployee = async (
  employee: CreateEmployee
): Promise<Employee> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
    },
    body: JSON.stringify(employee),
  });
  const data = await response.json();
  if (response.status === 201) {
    return data;
  }
  throw new Error(data.message);
};

export const updateEmployee = async (
  id: number,
  employee: CreateEmployee
): Promise<Employee> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/employees/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: JSON.stringify(employee),
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return data;
  }
  throw new Error(data.message);
};

export const uploadEmployeeImage = async (
  id: number,
  file: File
): Promise<Employee> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/employees/${id}/image`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: formData,
    }
  );
  const data = await response.json();
  if (response.status === 201) {
    return data;
  }
  throw new Error(data.message);
};
