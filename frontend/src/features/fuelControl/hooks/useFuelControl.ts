import {
  getFuelDailyControls,
  getFuelDailyControl,
  createFuelDailyControl,
  closeFuelDailyControl,
  signFuelDailyControl,
  getFuelOutputs,
  getFuelOutput,
  createFuelOutput,
  updateFuelOutput,
  signFuelOutput,
  getStockMovements,
  updateImage,
} from '../../../services/api/fuelControlService';

import type {
  FuelDailyControl,
  FuelOutput,
  FuelStockMovement,
  CreateFuelDailyControlDto,
  UpdateFuelDailyControlDto,
  CreateFuelOutputDto,
  UpdateFuelOutputDto,
  FuelControlFilters,
} from '../types';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 🟢 GET Paginated Fuel Daily Controls
export const useFuelDailyControls = (
  page: number = 1,
  pageSize: number = 10,
  filters?: FuelControlFilters
) => {
  return useQuery<{
    data: FuelDailyControl[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>({
    queryKey: ['fuel-daily-controls', page, pageSize, filters],
    queryFn: () => getFuelDailyControls(page, pageSize, filters),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 5,
  });
};

// 🟢 GET Fuel Daily Control by ID
export const useFuelDailyControl = (id: number | undefined) => {
  return useQuery<FuelDailyControl | null>({
    queryKey: ['fuel-daily-control', id],
    queryFn: () => getFuelDailyControl(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// 🔴 CREATE Fuel Daily Control
export const useFuelDailyControlCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFuelDailyControlDto) =>
      createFuelDailyControl(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-daily-controls'] });
    },
  });
};

// 🟡 CLOSE Fuel Daily Control
export const useFuelDailyControlClose = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateFuelDailyControlDto;
    }) => closeFuelDailyControl(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['fuel-daily-controls'] });
      queryClient.invalidateQueries({ queryKey: ['fuel-daily-control', id] });
    },
  });
};

// 🟡 SIGN Fuel Daily Control
export const useFuelDailyControlSign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => signFuelDailyControl(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['fuel-daily-controls'] });
      queryClient.invalidateQueries({ queryKey: ['fuel-daily-control', id] });
    },
  });
};

// 🟢 GET Fuel Outputs
export const useFuelOutputs = (fuelDailyControlId: number | undefined) => {
  return useQuery<FuelOutput[]>({
    queryKey: ['fuel-outputs', fuelDailyControlId],
    queryFn: () => getFuelOutputs(fuelDailyControlId!),
    enabled: !!fuelDailyControlId,
    staleTime: 1000 * 60 * 5,
  });
};

// 🟢 GET Fuel Output by ID
export const useFuelOutput = (id: number | undefined) => {
  return useQuery<FuelOutput | null>({
    queryKey: ['fuel-output', id],
    queryFn: () => getFuelOutput(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// 🔴 CREATE Fuel Output
export const useFuelOutputCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFuelOutputDto) => createFuelOutput(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['fuel-outputs', variables.fuelDailyControlId],
      });
      queryClient.invalidateQueries({ queryKey: ['fuel-daily-controls'] });
    },
  });
};

// 🟡 UPDATE Fuel Output
export const useFuelOutputUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFuelOutputDto }) =>
      updateFuelOutput(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['fuel-output', id] });
      queryClient.invalidateQueries({ queryKey: ['fuel-outputs'] });
    },
  });
};

// 🟡 UPDATE Fuel Output Image
export const useFuelOutputImageUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      updateImage(id, file),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['fuel-output', id] });
      queryClient.invalidateQueries({ queryKey: ['fuel-outputs'] });
    },
  });
};

// 🟡 SIGN Fuel Output
export const useFuelOutputSign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => signFuelOutput(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['fuel-output', id] });
      queryClient.invalidateQueries({ queryKey: ['fuel-outputs'] });
    },
  });
};

// 🟢 GET Stock Movements
export const useStockMovements = (
  warehouseId?: number,
  page: number = 1,
  pageSize: number = 10
) => {
  return useQuery<{
    data: FuelStockMovement[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>({
    queryKey: ['stock-movements', warehouseId, page, pageSize],
    queryFn: () => getStockMovements(warehouseId, page, pageSize),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 5,
  });
};
