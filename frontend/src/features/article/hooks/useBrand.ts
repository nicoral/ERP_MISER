import { useQuery } from '@tanstack/react-query';
import { getBrands } from '../../../services/api/articleService';
import type { Brand as BrandType } from '../../../types/brand';

export function useBrands() {
  const {
    data: brands = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<BrandType[], Error>({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  return {
    brands,
    loading: isLoading,
    error: isError ? (error?.message ?? 'Error al cargar las marcas') : null,
    refreshBrands: refetch,
  };
}
