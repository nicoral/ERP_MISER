import { useEffect, useState } from 'react';
import {
  getSupplier,
  getSuppliers,
} from '../../../services/api/supplierService';
import type { Supplier, SupplierFilters } from '../../../types/supplier';
import type { PaginatedResponse } from '../../../types/generic';

export const useSuppliers = (
  page: number = 1,
  pageSize: number = 10,
  filters?: SupplierFilters
) => {
  const [suppliers, setSuppliers] =
    useState<PaginatedResponse<Supplier> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const response = await getSuppliers(page, pageSize, filters);
        setSuppliers(response);
      } catch (error) {
        setError('Error al cargar los proveedores');
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, [page, pageSize, filters]);

  return { suppliers, loading, error };
};

export const useSupplier = (id: number) => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const response = await getSupplier(id);
        setSupplier(response);
      } catch (error) {
        setError('Error al cargar el proveedor');
        console.error('Error fetching supplier:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, [id]);

  return { supplier, loading, error };
};
