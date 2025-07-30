import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { entryPartService } from '../../../services/api/entryPartService';
import type {
  EntryPartType,
  UpdateEntryPartDto,
} from '../../../types/entryPart';

export const useEntryParts = (
  page: number,
  limit: number,
  type: EntryPartType
) => {
  return useQuery({
    queryKey: ['entry-parts', page, limit, type],
    queryFn: () => entryPartService.getEntryParts(page, limit, type),
  });
};

export const useEntryPart = (id: number) => {
  return useQuery({
    queryKey: ['entry-part', id],
    queryFn: () => entryPartService.getEntryPart(id),
    enabled: !!id,
  });
};

export const useCreateEntryPart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: entryPartService.createEntryPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entry-parts'] });
    },
  });
};

export const useUpdateEntryPart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEntryPartDto }) =>
      entryPartService.updateEntryPart(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entry-part', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['entry-parts'] });
    },
  });
};

export const useUploadEntryPartImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      entryPartService.uploadEntryPartImage(id, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entry-part', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['entry-parts'] });
    },
  });
};

export const useGetEntryPartReceptionConformity = () => {
  return useMutation({
    mutationFn: (id: number) =>
      entryPartService.getEntryPartReceptionConformity(id),
  });
};

export const useGetEntryPartPdf = () => {
  return useMutation({
    mutationFn: (id: number) => entryPartService.getEntryPartPdf(id),
  });
};
