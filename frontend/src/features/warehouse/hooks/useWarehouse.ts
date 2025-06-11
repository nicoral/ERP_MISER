import { useEffect, useState } from 'react';
import type { Warehouse, WarehouseCreate } from '../../../types/warehouse';
import {
  createWarehouse,
  getWarehouseById,
  getWarehouses,
  updateWarehouse,
} from '../../../services/api/warehouseService';
import type { PaginatedResponse } from '../../../types/generic';

export const useWarehouses = (page: number = 1, pageSize: number = 10) => {
  const [warehouses, setWarehouses] =
    useState<PaginatedResponse<Warehouse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        const response = await getWarehouses(page, pageSize);
        setWarehouses(response);
      } catch (error) {
        setError('Error al cargar los almacenes');
        console.error('Error fetching warehouses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, [page, pageSize]);

  return {
    warehouses,
    loading,
    error,
  };
};

export const useWarehouse = (id: number | undefined) => {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setLoading(true);
        const response = await getWarehouseById(id);
        setWarehouse(response);
      } catch (error) {
        setError('Error al cargar el almacén');
        console.error('Error fetching warehouse:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouse();
  }, [id]);

  return {
    warehouse,
    loading,
    error,
  };
};

export const useWarehouseCreate = (warehouse: WarehouseCreate) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saveWarehouse = async () => {
      try {
        setLoading(true);
        await createWarehouse(warehouse);
      } catch (error) {
        setError('Error al crear el almacén');
        console.error('Error creating warehouse:', error);
      } finally {
        setLoading(false);
      }
    };
    saveWarehouse();
  }, [warehouse]);

  return {
    loading,
    error,
  };
};

export const useWarehouseUpdate = (
  id: number,
  warehouse: Partial<WarehouseCreate>
) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updWarehouse = async () => {
      try {
        setLoading(true);
        await updateWarehouse(id, warehouse);
      } catch (error) {
        setError('Error al actualizar el almacén');
        console.error('Error updating warehouse:', error);
      } finally {
        setLoading(false);
      }
    };
    updWarehouse();
  }, [id, warehouse]);

  return {
    loading,
    error,
  };
};
