import type { Supplier, SupplierFilters } from '../../types/supplier';

const supplierNames = [
  'Suministros S.A.',
  'Proveedora Global',
  'Distribuciones Norte',
  'Materiales Express',
  'Logística Total',
  'Servicios Integrales',
  'Comercializadora Sur',
  'Importadora Este',
  'Exportadora Oeste',
  'Central de Insumos',
  'Almacenes Unidos',
  'Grupo Proveedor',
  'Red de Suministro',
  'Soluciones Industriales',
  'Proveedores Asociados',
  'Distribuidora Nacional',
  'Suministros del Centro',
  'Proveedora Selecta',
  'Comercializadora Premium',
  'Insumos y Más',
];
const contacts = [
  'Juan Pérez',
  'María Gómez',
  'Carlos Ruiz',
  'Ana Torres',
  'Pedro López',
  'Laura Díaz',
  'Miguel Sánchez',
  'Sofía Romero',
  'José Hernández',
  'Carmen García',
  'Luis Fernández',
  'Patricia Morales',
  'Jorge Castro',
  'Elena Vargas',
  'Raúl Ramos',
  'Lucía Ortega',
  'Andrés Navarro',
  'Marta Gil',
  'Alberto Molina',
  'Silvia Paredes',
];

function generateMockSuppliers(): Supplier[] {
  return Array.from({ length: 50 }, (_, i) => ({
    code: `SUP${(i + 1).toString().padStart(3, '0')}`,
    name: supplierNames[i % supplierNames.length],
    contact: contacts[i % contacts.length],
    active: Math.random() > 0.2,
  }));
}

const mockSuppliers: Supplier[] = generateMockSuppliers();

export async function getSuppliers(
  page: number = 1,
  pageSize: number = 10,
  filters?: SupplierFilters
) {
  return new Promise<{
    data: Supplier[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(resolve => {
    setTimeout(() => {
      let filtered = [...mockSuppliers];
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
        if (filters.contact) {
          filtered = filtered.filter(s =>
            s.contact.toLowerCase().includes(filters.contact!.toLowerCase())
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
