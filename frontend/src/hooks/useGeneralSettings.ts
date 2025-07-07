import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGeneralSettings,
  updateGeneralSettings,
  getCurrentExchangeRate,
  getCurrentSaleRate,
  updateExchangeRate,
  shouldUpdateExchangeRate,
  uploadLogo,
  type UpdateGeneralSettingsDto,
  getGeneralTax,
} from '../services/api/generalSettingsService';

/**
 * Hook para obtener las configuraciones generales
 */
export const useGeneralSettings = () => {
  return useQuery({
    queryKey: ['generalSettings'],
    queryFn: getGeneralSettings,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para actualizar las configuraciones generales
 */
export const useUpdateGeneralSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateData: UpdateGeneralSettingsDto) =>
      updateGeneralSettings(updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generalSettings'] });
    },
  });
};

/**
 * Hook para subir el logo de la empresa
 */
export const useUploadLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generalSettings'] });
    },
  });
};

/**
 * Hook para obtener el tipo de cambio actual
 */
export const useCurrentExchangeRate = () => {
  return useQuery({
    queryKey: ['exchangeRate'],
    queryFn: getCurrentExchangeRate,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
  });
};

/**
 * Hook para obtener solo el tipo de cambio de venta
 */
export const useCurrentSaleRate = () => {
  return useQuery({
    queryKey: ['saleRate'],
    queryFn: getCurrentSaleRate,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
  });
};

/**
 * Hook para actualizar manualmente el tipo de cambio
 */
export const useUpdateExchangeRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExchangeRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeRate'] });
      queryClient.invalidateQueries({ queryKey: ['saleRate'] });
      queryClient.invalidateQueries({ queryKey: ['generalSettings'] });
    },
  });
};

/**
 * Hook para verificar si el tipo de cambio necesita actualización
 */
export const useShouldUpdateExchangeRate = () => {
  return useQuery({
    queryKey: ['shouldUpdateExchangeRate'],
    queryFn: shouldUpdateExchangeRate,
    staleTime: 60 * 1000, // 1 minuto
  });
};

/**
 * Hook para obtener el impuesto general
 */
export const useGeneralTax = () => {
  return useQuery({
    queryKey: ['generalTax'],
    queryFn: getGeneralTax,
  });
};
