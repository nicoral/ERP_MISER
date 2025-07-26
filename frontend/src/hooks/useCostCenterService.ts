import { useQuery } from '@tanstack/react-query';
import { getCostCentersSimple } from '../services/api/costCenterService';

export const useCostCentersSimple = () => {
  return useQuery({
    queryKey: ['cost-centers-simple'],
    queryFn: getCostCentersSimple,
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: true, // Siempre habilitado para mostrar todos los centros de costo
  });
};
