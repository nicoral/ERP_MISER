import { useQuery } from '@tanstack/react-query';
import {
  getSunatExchangeRate,
  getSunatSaleRate,
} from '../services/api/sunatService';

/**
 * Hook para obtener el tipo de cambio completo de SUNAT
 */
export const useSunatExchangeRate = () => {
  return useQuery({
    queryKey: ['sunat-exchange-rate'],
    queryFn: getSunatExchangeRate,
    staleTime: 1000 * 60 * 60, // 1 hora (los tipos de cambio no cambian frecuentemente)
    refetchInterval: 1000 * 60 * 60, // Refetch cada hora
    retry: 3,
    retryDelay: 1000 * 30, // Esperar 30 segundos entre reintentos
  });
};

/**
 * Hook para obtener solo el tipo de cambio de venta de SUNAT
 */
export const useSunatSaleRate = () => {
  return useQuery({
    queryKey: ['sunat-sale-rate'],
    queryFn: getSunatSaleRate,
    staleTime: 1000 * 60 * 60, // 1 hora
    refetchInterval: 1000 * 60 * 60, // Refetch cada hora
    retry: 3,
    retryDelay: 1000 * 30, // Esperar 30 segundos entre reintentos
  });
};
