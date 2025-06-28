import { useState, useEffect, useRef } from 'react';
import { type Supplier } from '../types/supplier';
import { getSuppliers } from '../services/api/supplierService';

export const useSupplierService = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      // Si ya se cargaron los suppliers, no volver a cargar
      if (hasLoaded.current && suppliers.length > 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getSuppliers();
        setSuppliers(data.data);
        hasLoaded.current = true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar proveedores'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Función para forzar recarga si es necesario
  const refetchSuppliers = async () => {
    hasLoaded.current = false;
    setLoading(true);
    setError(null);
    try {
      const data = await getSuppliers();
      setSuppliers(data.data);
      hasLoaded.current = true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar proveedores'
      );
    } finally {
      setLoading(false);
    }
  };

  return { suppliers, loading, error, refetchSuppliers };
};
