import { useState } from 'react';
import {
  type FuelControl,
  type FuelControlFilters,
  type FuelControlStatistics,
  type FuelOutput,
  type FuelInput,
  type FuelSupply,
  type CreateFuelSupply,
  FuelControlStatus,
} from '../types';

// Mock data for development
const mockFuelControls: FuelControl[] = [
  {
    id: 1,
    date: '2024-01-15',
    responsible: 'Juan Pérez',
    status: FuelControlStatus.IN_PROGRESS,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 2,
    date: '2024-01-14',
    responsible: 'María García',
    status: FuelControlStatus.PENDING_SIGNATURE_1,
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-14T08:00:00Z',
  },
  {
    id: 3,
    date: '2024-01-13',
    responsible: 'Carlos López',
    status: FuelControlStatus.COMPLETED,
    createdAt: '2024-01-13T08:00:00Z',
    updatedAt: '2024-01-13T08:00:00Z',
  },
];

const mockFuelOutputs: FuelOutput[] = [
  {
    id: 1,
    fuelControlId: 1,
    vehicle: 'Camión 001',
    driver: 'Pedro Martínez',
    quantity: 50,
    unit: 'L',
    purpose: 'Transporte de materiales',
    notes: 'Salida para obra norte',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 2,
    fuelControlId: 1,
    vehicle: 'Excavadora 002',
    driver: 'Ana Rodríguez',
    quantity: 30,
    unit: 'L',
    purpose: 'Excavación',
    notes: 'Trabajo en zona sur',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];

const mockFuelInputs: FuelInput[] = [
  {
    id: 1,
    fuelControlId: 1,
    purchaseOrder: 'OC-2024-001',
    supplier: 'PetroPerú',
    quantity: 200,
    unit: 'L',
    price: 3.5,
    total: 700,
    notes: 'Entrega programada',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 2,
    fuelControlId: 2,
    purchaseOrder: 'OC-2024-002',
    supplier: 'Repsol',
    quantity: 150,
    unit: 'L',
    price: 3.75,
    total: 562.5,
    notes: 'Entrega urgente',
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-14T08:00:00Z',
  },
  {
    id: 3,
    fuelControlId: 3,
    purchaseOrder: 'OC-2024-003',
    supplier: 'Primax',
    quantity: 300,
    unit: 'L',
    price: 3.6,
    total: 1080,
    notes: 'Entrega mensual',
    createdAt: '2024-01-13T08:00:00Z',
    updatedAt: '2024-01-13T08:00:00Z',
  },
];

const mockFuelSupplies: FuelSupply[] = [
  {
    id: 1,
    fuelControlId: 1,
    operatorId: 1,
    operatorName: 'Pedro Martínez',
    hourmeter: 1250,
    gallons: 25,
    photoUrl: '',
    costCenterId: 1,
    costCenterName: 'Mina Norte',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 2,
    fuelControlId: 1,
    operatorId: 2,
    operatorName: 'Ana Rodríguez',
    hourmeter: 890,
    gallons: 15,
    photoUrl: '',
    costCenterId: 2,
    costCenterName: 'Mina Sur',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
];

export const useFuelControlService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFuelControls = async (
    page: number = 1,
    limit: number = 10,
    filters: FuelControlFilters = {}
  ) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredData = [...mockFuelControls];

      // Apply filters
      if (filters.status) {
        filteredData = filteredData.filter(
          item => item.status === filters.status
        );
      }

      if (filters.date) {
        filteredData = filteredData.filter(item => item.date === filters.date);
      }

      if (filters.responsible) {
        filteredData = filteredData.filter(item =>
          item.responsible
            .toLowerCase()
            .includes(filters.responsible!.toLowerCase())
        );
      }

      if (filters.search) {
        filteredData = filteredData.filter(
          item =>
            item.responsible
              .toLowerCase()
              .includes(filters.search!.toLowerCase()) ||
            item.date.includes(filters.search!)
        );
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return {
        fuelControls: paginatedData,
        total: filteredData.length,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  };

  const getFuelControlById = async (id: number) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const fuelControl = mockFuelControls.find(fc => fc.id === id);
      if (!fuelControl) {
        throw new Error('Control de combustible no encontrado');
      }

      return fuelControl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  };

  const getFuelOutputs = async (fuelControlId: number) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const outputs = mockFuelOutputs.filter(
        fo => fo.fuelControlId === fuelControlId
      );
      return outputs;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return [];
    }
  };

  const getFuelInputs = async (fuelControlId: number) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const inputs = mockFuelInputs.filter(
        fi => fi.fuelControlId === fuelControlId
      );
      return inputs;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return [];
    }
  };

  const getFuelSupplies = async (fuelControlId: number) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      const supplies = mockFuelSupplies.filter(
        fs => fs.fuelControlId === fuelControlId
      );
      return supplies;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return [];
    }
  };

  const createFuelSupply = async (data: CreateFuelSupply) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newFuelSupply: FuelSupply = {
        id: Math.max(...mockFuelSupplies.map(fs => fs.id)) + 1,
        fuelControlId: data.fuelControlId,
        operatorId: data.operatorId,
        operatorName: 'Operador', // En un caso real, se obtendría del empleado
        hourmeter: data.hourmeter,
        gallons: data.gallons,
        photoUrl: data.photoUrl || '',
        costCenterId: data.costCenterId,
        costCenterName: 'Centro de Costos', // En un caso real, se obtendría del centro de costos
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockFuelSupplies.push(newFuelSupply);
      return newFuelSupply;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  };

  const getFuelControlStatistics =
    async (): Promise<FuelControlStatistics | null> => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));

        const stats: FuelControlStatistics = {
          IN_PROGRESS: mockFuelControls.filter(
            fc => fc.status === FuelControlStatus.IN_PROGRESS
          ).length,
          PENDING_SIGNATURE_1: mockFuelControls.filter(
            fc => fc.status === FuelControlStatus.PENDING_SIGNATURE_1
          ).length,
          PENDING_SIGNATURE_2: mockFuelControls.filter(
            fc => fc.status === FuelControlStatus.PENDING_SIGNATURE_2
          ).length,
          PENDING_SIGNATURE_3: mockFuelControls.filter(
            fc => fc.status === FuelControlStatus.PENDING_SIGNATURE_3
          ).length,
          COMPLETED: mockFuelControls.filter(
            fc => fc.status === FuelControlStatus.COMPLETED
          ).length,
        };

        return stats;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        return null;
      }
    };

  const createFuelControl = async (data: Partial<FuelControl>) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newFuelControl: FuelControl = {
        id: Math.max(...mockFuelControls.map(fc => fc.id)) + 1,
        date: data.date || new Date().toISOString().split('T')[0],
        responsible: data.responsible || '',
        status: FuelControlStatus.IN_PROGRESS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockFuelControls.push(newFuelControl);
      return newFuelControl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateFuelControl = async (id: number, data: Partial<FuelControl>) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const index = mockFuelControls.findIndex(fc => fc.id === id);
      if (index === -1) {
        throw new Error('Control de combustible no encontrado');
      }

      mockFuelControls[index] = {
        ...mockFuelControls[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return mockFuelControls[index];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTodayFuelControl = async () => {
    const today = new Date().toISOString().split('T')[0];
    const todayControl = mockFuelControls.find(fc => fc.date === today);
    return todayControl || null;
  };

  return {
    getFuelControls,
    getFuelControlById,
    getFuelOutputs,
    getFuelInputs,
    getFuelSupplies,
    createFuelSupply,
    getFuelControlStatistics,
    createFuelControl,
    updateFuelControl,
    getTodayFuelControl,
    loading,
    error,
  };
};
