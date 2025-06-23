import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSupplier,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../../../services/api/supplierService';
import type { Supplier, SupplierFilters } from '../../../types/supplier';
import type { PaginatedResponse } from '../../../types/generic';

/**
 * Lista de proveedores con paginación y filtros.
 */
export const useSuppliers = (
  page: number = 1,
  pageSize: number = 10,
  filters?: SupplierFilters
) => {
  return useQuery<PaginatedResponse<Supplier>>({
    queryKey: ['suppliers', { page, pageSize, filters }],
    queryFn: () => getSuppliers(page, pageSize, filters),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Obtiene un proveedor por ID.
 */
export const useSupplier = (id: number | undefined) => {
  return useQuery<Supplier | null>({
    queryKey: ['supplier', id],
    queryFn: () => getSupplier(id!),
    placeholderData: prev => prev,
    enabled: !!id,
  });
};

/**
 * Crear proveedor.
 */
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    ) => createSupplier(data as Supplier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

/**
 * Actualizar proveedor.
 */
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Supplier, 'id'> }) =>
      updateSupplier(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

/**
 * Eliminar proveedor.
 */
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};
