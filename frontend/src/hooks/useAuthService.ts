import { useEffect, useState } from 'react';
import type { Warehouse } from '../types/warehouse';
import { getWarehousesByEmployeeId } from '../services/auth/authService';

export const useAuthWarehouse = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const response = await getWarehousesByEmployeeId();
        setWarehouses(response);
      } catch (error) {
        setError('Error al cargar los almacenes del usuario');
        console.error('Error fetching warehouses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouse();
  }, []);

  return { warehouses, loading, error };
};
