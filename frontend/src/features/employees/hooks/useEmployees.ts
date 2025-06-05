import { useState, useEffect } from 'react';
import { getEmployees } from '../../../services/api/employeeService';
import type { Employee } from '../../../types/employee';
import type { PaginatedResponse } from '../../../services/api/employeeService';

export const useEmployees = (page: number = 1, pageSize: number = 10) => {
  const [employees, setEmployees] = useState<PaginatedResponse<Employee> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getEmployees(page, pageSize);
        setEmployees(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los empleados');
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [page, pageSize]);

  return { employees, loading, error };
}; 