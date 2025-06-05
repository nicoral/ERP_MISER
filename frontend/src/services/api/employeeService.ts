import type { Employee, PaginatedResponse, EmployeeFilters } from '../../types/employee';

// Generar más datos de ejemplo
const generateMockEmployees = (): Employee[] => {
  const positions = ['Supervisor', 'Operario', 'Gerente', 'Analista', 'Desarrollador'];
  const roles = ['Administrador', 'Supervisor', 'Usuario'];
  const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Miguel', 'Sofía', 'José', 'Carmen'];
  const lastNames = ['Pérez', 'González', 'Rodríguez', 'López', 'Martínez', 'García', 'Hernández', 'Díaz', 'Moreno', 'Sánchez'];

  return Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    position: positions[Math.floor(Math.random() * positions.length)],
    phone: `300${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    active: Math.random() > 0.2, // 80% de probabilidad de estar activo
  }));
};

export const mockEmployees = generateMockEmployees();

export const getEmployee = async (id: number): Promise<Employee | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockEmployees.find(emp => emp.id === id);
};

export async function getEmployees(
  page: number = 1,
  pageSize: number = 10,
  filters?: EmployeeFilters
): Promise<PaginatedResponse<Employee>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredEmployees = [...mockEmployees];
      
      // Aplicar filtros si existen
      if (filters) {
        if (filters.firstName) {
          filteredEmployees = filteredEmployees.filter(emp => 
            emp.firstName.toLowerCase().includes(filters.firstName!.toLowerCase())
          );
        }
        
        if (filters.lastName) {
          filteredEmployees = filteredEmployees.filter(emp => 
            emp.lastName.toLowerCase().includes(filters.lastName!.toLowerCase())
          );
        }
      }

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredEmployees.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredEmployees.length / pageSize);

      resolve({
        data: paginatedData,
        total: filteredEmployees.length,
        page,
        pageSize,
        totalPages,
      });
    }, 600);
  });
} 