import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getArticle,
  getArticles,
  createArticle,
  updateArticle,
} from '../../../services/api/articleService';
import type {
  Article,
  ArticleCreateDto,
  ArticleFilters,
} from '../../../types/article';
import type { PaginatedResponse } from '../../../types/generic';

/**
 * Lista de artículos con paginación y filtros.
 */
export const useArticles = (
  page: number = 1,
  pageSize: number = 10,
  filters?: ArticleFilters
) => {
  return useQuery<PaginatedResponse<Article>>({
    queryKey: ['articles', { page, pageSize, filters }],
    queryFn: () => getArticles(page, pageSize, filters),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Obtiene un artículo por ID.
 */
export const useArticle = (id: number | undefined) => {
  return useQuery<Article | null>({
    queryKey: ['article', id],
    queryFn: () => getArticle(id),
    placeholderData: prev => prev,
    enabled: !!id,
  });
};

/**
 * Crear artículo.
 */
export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ArticleCreateDto) => createArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

/**
 * Actualizar artículo.
 */
export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ArticleCreateDto }) =>
      updateArticle(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['article', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};
