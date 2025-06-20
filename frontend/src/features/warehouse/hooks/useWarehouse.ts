import {
  createWarehouse,
  getWarehouseById,
  getWarehouses,
  updateWarehouse,
  deleteWarehouse,
} from '../../../services/api/warehouseService';

import type {
  Warehouse,
  WarehouseCreate,
  WarehouseFilters,
} from '../../../types/warehouse';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PaginatedResponse } from '../../../types/generic';

// 🟢 GET Paginated Warehouses
export const useWarehouses = (
  page: number = 1,
  pageSize: number = 10,
  filters?: WarehouseFilters
) => {
  return useQuery<PaginatedResponse<Warehouse>>({
    queryKey: ['warehouses', page, pageSize, filters],
    queryFn: () => getWarehouses(page, pageSize, filters),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 5,
  });
};

// 🟢 GET Warehouse by ID
export const useWarehouse = (id: number | undefined) => {
  return useQuery<Warehouse | null>({
    queryKey: ['warehouse', id],
    queryFn: () => getWarehouseById(id!),
    enabled: !!id, // solo ejecuta si hay ID
    staleTime: 1000 * 60 * 5,
  });
};

// 🔴 CREATE Warehouse
export const useWarehouseCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WarehouseCreate) => createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
};

// 🟡 UPDATE Warehouse
export const useWarehouseUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<WarehouseCreate>;
    }) => updateWarehouse(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse', id] });
    },
  });
};

// 🔴 DELETE Warehouse
export const useWarehouseDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });
};
