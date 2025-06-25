import { useQuery } from '@tanstack/react-query';
import { getEmployeesSimple } from '../services/api/employeeService';

/**
 * Lista de empleados con búsqueda en tiempo real.
 */
export const useEmployeesSimple = (search?: string) => {
  return useQuery({
    queryKey: ['employees-simple', { search }],
    queryFn: () => getEmployeesSimple(search),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: true, // Siempre habilitado para mostrar todos los empleados
  });
};
