import { useEffect, useState } from 'react';
import type { Employee } from '../../../types/employee';
import { getEmployee } from '../../../services/api/employeeService';

export const useEmployee = (id?: number) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getEmployee(id)
      .then(emp => setEmployee(emp ?? null))
      .catch(() => setError('Error al cargar el empleado'))
      .finally(() => setLoading(false));
  }, [id]);

  return { employee, loading, error };
}; 