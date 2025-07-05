import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} from '../../../services/api/serviceService';
import type { Service } from '../../../types/service';

/**
 * Lista de servicios con paginación y filtros.
 */
export const useServices = (
  page: number = 1,
  pageSize: number = 10,
  search?: string
) => {
  return useQuery({
    queryKey: ['services', { page, pageSize, search }],
    queryFn: () => getServices(page, pageSize, search),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Obtiene un servicio por ID.
 */
export const useService = (id: number | undefined) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => getService(id!),
    placeholderData: prev => prev,
    enabled: !!id,
  });
};

/**
 * Crear servicio.
 */
export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Service>) => createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

/**
 * Actualizar servicio.
 */
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Service> }) =>
      updateService(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['service', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

/**
 * Eliminar servicio.
 */
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
