import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCostCenter,
  getCostCenters,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
} from '../../../services/api/costCenterService';
import type {
  CostCenter,
  CreateCostCenter,
  UpdateCostCenter,
} from '../../../types/costCenter';
import type { PaginatedResponse } from '../../../types/generic';

/**
 * Lista de centros de costo con paginación y búsqueda.
 */
export const useCostCenters = (
  page: number = 1,
  pageSize: number = 10,
  search?: string
) => {
  return useQuery<PaginatedResponse<CostCenter>>({
    queryKey: ['costCenters', { page, pageSize, search }],
    queryFn: () => getCostCenters(page, pageSize, search),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Obtiene un centro de costo por ID.
 */
export const useCostCenter = (id: number | undefined) => {
  return useQuery<CostCenter | null>({
    queryKey: ['costCenter', id],
    queryFn: () => getCostCenter(id!),
    placeholderData: prev => prev,
    enabled: !!id,
  });
};

/**
 * Crear centro de costo.
 */
export const useCreateCostCenter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCostCenter) => createCostCenter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costCenters'] });
    },
  });
};

/**
 * Actualizar centro de costo.
 */
export const useUpdateCostCenter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCostCenter }) =>
      updateCostCenter(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['costCenter', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['costCenters'] });
    },
  });
};

/**
 * Eliminar centro de costo.
 */
export const useDeleteCostCenter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCostCenter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costCenters'] });
    },
  });
};
