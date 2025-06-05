import { useState, useEffect } from 'react';
import type { Employee } from '../../../types/employee';

// TODO: Reemplazar con llamadas reales a la API
const mockEmployees: Employee[] = [
  {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    position: 'Supervisor',
    phone: '3001234567',
    role: 'Administrador',
    active: true,
  },
  {
    id: 2,
    firstName: 'María',
    lastName: 'González',
    position: 'Operario',
    phone: '3007654321',
    role: 'Usuario',
    active: true,
  },
  {
    id: 3,
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    position: 'Supervisor',
    phone: '3009876543',
    role: 'Supervisor',
    active: false,
  },
];

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Simulación de llamada a API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEmployees(mockEmployees);
      } catch {
        setError('Error al cargar los empleados');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return { employees, loading, error };
}; 