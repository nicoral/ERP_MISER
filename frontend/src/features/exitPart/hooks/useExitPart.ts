import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { exitPartService } from '../../../services/api/exitPartService';
import type { UpdateExitPartDto } from '../../../types/exitPart';
import type { EntryPartType } from '../../../types/entryPart';

export const useExitParts = (
  page: number,
  limit: number,
  type: EntryPartType
) => {
  return useQuery({
    queryKey: ['exit-parts', page, limit, type],
    queryFn: () => exitPartService.getExitParts(page, limit, type),
  });
};

export const useExitPart = (id: number) => {
  return useQuery({
    queryKey: ['exit-part', id],
    queryFn: () => exitPartService.getExitPart(id),
    enabled: !!id,
  });
};

export const useCreateExitPart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: exitPartService.createExitPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-parts'] });
    },
  });
};

export const useUpdateExitPart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExitPartDto }) =>
      exitPartService.updateExitPart(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exit-part', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['exit-parts'] });
    },
  });
};

export const useUploadExitPartImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      exitPartService.uploadExitPartImage(id, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exit-part', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['exit-parts'] });
    },
  });
};
