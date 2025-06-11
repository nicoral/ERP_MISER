import type { Service, ServiceFilters } from '../../types/service';

const serviceNames = [
  'Transporte',
  'Mantenimiento',
  'Limpieza',
  'Consultoría',
  'Reparación',
  'Instalación',
  'Capacitación',
  'Supervisión',
  'Auditoría',
  'Soporte',
  'Alquiler',
  'Logística',
  'Desinfección',
  'Seguridad',
  'Montaje',
  'Desmontaje',
  'Revisión',
  'Certificación',
  'Asesoría',
  'Entrega',
];
const types = [
  'Interno',
  'Externo',
  'Tercerizado',
  'Especializado',
  'General',
  'Técnico',
  'Administrativo',
  'Operativo',
  'Profesional',
  'Temporal',
];

function generateMockServices(): Service[] {
  return Array.from({ length: 50 }, (_, i) => ({
    code: `SER${(i + 1).toString().padStart(3, '0')}`,
    name: serviceNames[i % serviceNames.length],
    type: types[i % types.length],
    active: Math.random() > 0.2,
  }));
}

const mockServices: Service[] = generateMockServices();

export async function getServices(
  page: number = 1,
  pageSize: number = 10,
  filters?: ServiceFilters
) {
  return new Promise<{
    data: Service[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(resolve => {
    setTimeout(() => {
      let filtered = [...mockServices];
      if (filters) {
        if (filters.code) {
          filtered = filtered.filter(s =>
            s.code.toLowerCase().includes(filters.code!.toLowerCase())
          );
        }
        if (filters.name) {
          filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(filters.name!.toLowerCase())
          );
        }
        if (filters.type) {
          filtered = filtered.filter(s =>
            s.type.toLowerCase().includes(filters.type!.toLowerCase())
          );
        }
      }
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginated = filtered.slice(start, end);
      const totalPages = Math.ceil(filtered.length / pageSize);
      resolve({
        data: paginated,
        total: filtered.length,
        page,
        pageSize,
        totalPages,
      });
    }, 600);
  });
}
