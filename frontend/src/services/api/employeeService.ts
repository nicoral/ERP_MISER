import { STORAGE_KEY_TOKEN } from '../../config/constants';
import type {
  CreateEmployee,
  Employee,
  EmployeeFilters,
  UpdateEmployee,
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
  employee: UpdateEmployee
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

export const deleteEmployee = async (id: number): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/employees/${id}`,
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
    throw new Error(data.message || 'Error al eliminar el empleado');
  }
};

export const downloadEmployeeTemplate = async (): Promise<Blob> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/employees/import/template`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );

  if (response.status === 200) {
    return response.blob();
  }

  const data = await response.json();
  throw new Error(data.message || 'Error al descargar el template');
};

export interface ImportResult {
  message: string;
  success: number;
  errors: Array<{ row: number; error: string }>;
  total: number;
}

export const importEmployeesFromExcel = async (
  file: File
): Promise<ImportResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/employees/import/excel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (response.status === 200 || response.status === 201) {
    return data;
  }

  throw new Error(data.message || 'Error al importar empleados');
};

export const getEmployeesSimple = async (
  search?: string
): Promise<Employee[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/employees/list/simple?search=${search}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );
  const data = await response.json();
  return data;
};
