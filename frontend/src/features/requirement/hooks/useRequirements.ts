import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRequirement,
  getRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
  publishRequirement,
  generateRequirementPdf,
  signRequirement,
  rejectRequirement,
} from '../../../services/api/requirementService';
import type { CreateRequirementDto } from '../../../types/requirement';

/**
 * Lista de requerimientos con paginación.
 */
export const useRequirements = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ['requirements', { page, pageSize }],
    queryFn: () => getRequirements(page, pageSize),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Obtiene un requerimiento por ID.
 */
export const useRequirement = (id: number | undefined) => {
  return useQuery({
    queryKey: ['requirement', id],
    queryFn: () => getRequirement(id!),
    placeholderData: prev => prev,
    enabled: !!id,
  });
};

/**
 * Crear requerimiento.
 */
export const useCreateRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRequirementDto) => createRequirement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });
};

/**
 * Actualizar requerimiento.
 */
export const useUpdateRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateRequirementDto }) =>
      updateRequirement(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['requirement', variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });
};

/**
 * Eliminar requerimiento.
 */
export const useDeleteRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRequirement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });
};

/**
 * Publicar requerimiento.
 */
export const usePublishRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => publishRequirement(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requirement', variables] });
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });
};

/**
 * Firmar requerimiento.
 */
export const useSignRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => signRequirement(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requirement', variables] });
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });
};

/**
 * Rechazar requerimiento.
 */
export const useRejectRequirement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      rejectRequirement(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requirement', variables] });
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
    },
  });
};

/**
 * Generar PDF del requerimiento.
 */
export const useGenerateRequirementPdf = () => {
  return useMutation({
    mutationFn: (id: number) => generateRequirementPdf(id),
  });
};
