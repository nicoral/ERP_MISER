import type { Employee } from '../../types/employee';

export const mockEmployees: Employee[] = [
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

export const getEmployee = async (id: number): Promise<Employee | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockEmployees.find(emp => emp.id === id);
};

export async function getEmployees(): Promise<Employee[]> {
  // Simula una petición al backend
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEmployees);
    }, 600);
  });
} 