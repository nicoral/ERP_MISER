import { createApiCall } from './httpInterceptor';
import type {
  CreateEmployee,
  Employee,
  EmployeeFilters,
  UpdateEmployee,
} from '../../types/employee';
import type { PaginatedResponse } from '../../types/generic';

const BASE_URL = `${import.meta.env.VITE_API_URL}/employees`;

export const employeeService = {
  async getEmployee(id: number): Promise<Employee | undefined> {
    const response = await createApiCall<Employee>(`${BASE_URL}/${id}`, {
      method: 'GET',
    });
    return response;
  },

  async getEmployees(
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

    const response = await createApiCall<{
      data: Employee[];
      total: number;
      page: number;
      limit: number;
    }>(`${BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
    });

    return {
      data: response.data,
      total: response.total,
      page: response.page,
      pageSize: response.limit,
      totalPages: Math.ceil(response.total / response.limit),
    };
  },

  async createEmployee(employee: CreateEmployee): Promise<Employee> {
    const response = await createApiCall<Employee>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(employee),
    });
    return response;
  },

  async updateEmployee(
    id: number,
    employee: UpdateEmployee
  ): Promise<Employee> {
    const response = await createApiCall<Employee>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
    return response;
  },

  async uploadEmployeeImage(id: number, file: File): Promise<Employee> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await createApiCall<Employee>(
      `${BASE_URL}/${id}/image`,
      {
        method: 'POST',
        body: formData,
      },
      false,
      true
    );
    return response;
  },

  async deleteEmployee(id: number): Promise<void> {
    const response = await createApiCall<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  async downloadEmployeeTemplate(): Promise<Blob> {
    const response = await createApiCall<Blob>(
      `${BASE_URL}/import/template`,
      {
        method: 'GET',
      },
      true
    );
    return response;
  },

  async importEmployeesFromExcel(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await createApiCall<ImportResult>(
      `${BASE_URL}/import/excel`,
      {
        method: 'POST',
        body: formData,
      },
      false,
      true
    );
    return response;
  },

  async getEmployeesSimple(search?: string): Promise<Employee[]> {
    const response = await createApiCall<Employee[]>(
      `${BASE_URL}/list/simple?search=${search}`,
      {
        method: 'GET',
      }
    );
    return response;
  },
};

export interface ImportResult {
  message: string;
  success: number;
  errors: Array<{ row: number; error: string }>;
  total: number;
}

// Legacy exports for backward compatibility
export const getEmployee = employeeService.getEmployee;
export const getEmployees = employeeService.getEmployees;
export const createEmployee = employeeService.createEmployee;
export const updateEmployee = employeeService.updateEmployee;
export const uploadEmployeeImage = employeeService.uploadEmployeeImage;
export const deleteEmployee = employeeService.deleteEmployee;
export const downloadEmployeeTemplate =
  employeeService.downloadEmployeeTemplate;
export const importEmployeesFromExcel =
  employeeService.importEmployeesFromExcel;
export const getEmployeesSimple = employeeService.getEmployeesSimple;
