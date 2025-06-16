import { useState, useEffect } from 'react';
import { getCostCenter } from '../../../services/api/costCenterService';
import type { CostCenter } from '../../../types/costCenter';

export const useCostCenter = (id: number) => {
  const [costCenter, setCostCenter] = useState<CostCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCostCenter = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCostCenter(id);
        setCostCenter(data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el centro de costo');
      } finally {
        setLoading(false);
      }
    };

    fetchCostCenter();
  }, [id]);

  return { costCenter, loading, error };
};
