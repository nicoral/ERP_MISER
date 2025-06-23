import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEmployee,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  uploadEmployeeImage,
} from '../../../services/api/employeeService';
import type {
  Employee,
  CreateEmployee,
  UpdateEmployee,
  EmployeeFilters,
} from '../../../types/employee';
import type { PaginatedResponse } from '../../../types/generic';

/**
 * Lista de empleados con paginación y filtros.
 */
export const useEmployees = (
  page: number = 1,
  pageSize: number = 10,
  filters?: EmployeeFilters
) => {
  return useQuery<PaginatedResponse<Employee>>({
    queryKey: ['employees', { page, pageSize, filters }],
    queryFn: () => getEmployees(page, pageSize, filters),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Obtiene un empleado por ID.
 */
export const useEmployee = (id: number | undefined) => {
  return useQuery<Employee | null>({
    queryKey: ['employee', id],
    queryFn: async () => {
      const employee = await getEmployee(id!);
      return employee || null;
    },
    placeholderData: prev => prev,
    enabled: !!id,
  });
};

/**
 * Crear empleado.
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployee) => createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

/**
 * Actualizar empleado.
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployee }) =>
      updateEmployee(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

/**
 * Eliminar empleado.
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

/**
 * Subir imagen de empleado.
 */
export const useUploadEmployeeImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      uploadEmployeeImage(id, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
