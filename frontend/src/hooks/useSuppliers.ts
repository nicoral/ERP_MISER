import { useState, useEffect, useCallback } from 'react';
import { getSuppliers } from '../services/api/supplierService';
import type { Supplier } from '../types/supplier';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSuppliers(1, 10, { name: search });
      setSuppliers(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error loading suppliers';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const refetch = useCallback(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    refetch,
    fetchSuppliers,
  };
};
