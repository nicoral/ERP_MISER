import { useState, useEffect } from 'react';
import {
  getCostCenter,
  getCostCenters,
} from '../../../services/api/costCenterService';
import type { CostCenter } from '../../../types/costCenter';

export const useCostCenters = (
  page: number = 1,
  pageSize: number = 10,
  search?: string
) => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCostCenters = async () => {
      try {
        const response = await getCostCenters(page, pageSize, search);
        setCostCenters(response.data);
      } catch (error) {
        setError('Error al cargar los centros de costo');
        console.error('Error fetching cost centers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCostCenters();
  }, []);

  return { costCenters, loading, error };
};

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
