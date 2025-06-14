export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const STORAGE_KEY_TOKEN = 'erp-miser-token';
export const STORAGE_KEY_USER = 'erp-miser-user';

export const APP_CONFIG = {
  name: 'ERP MISER',
  version: '1.0.0',
  defaultLanguage: 'es',
  supportedLanguages: ['es', 'en'],
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMINISTRATION: '/administration',
  EMPLOYEES: '/employees',
  EMPLOYEE_CREATE: '/employees/create',
  EMPLOYEE_EDIT: '/employees/:id/edit',
  ROLES: '/roles',
  ROLES_EDIT: '/roles/:id',
  PROCESS: '/process',
  PROCESS_REQUIREMENT: '/process/requirement',
  WAREHOUSE: '/warehouse',
  WAREHOUSE_CREATE: '/warehouse/create',
  WAREHOUSE_EDIT: '/warehouse/:id/edit',
  WAREHOUSE_ARTICLES: '/warehouse/articles',
  WAREHOUSE_ARTICLE_CREATE: '/warehouse/articles/create',
  WAREHOUSE_ARTICLE_EDIT: '/warehouse/articles/:id/edit',
  WAREHOUSE_SERVICES: '/warehouse/services',
  WAREHOUSE_SUPPLIERS: '/warehouse/suppliers',
  PROFILE: '/profile',
} as const;

export const ALPHABET = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;

export const UNITS_OF_MEASURE = [
  { name: 'UNIDAD', code: 'UN' },
  { name: 'KILOGRAMO', code: 'KG' },
  { name: 'KIT', code: 'KIT' },
  { name: 'LITRO', code: 'L' },
  { name: 'GALON', code: 'GAL' },
  { name: 'ONZA', code: 'OZ' },
  { name: 'PIEZA', code: 'PC' },
  { name: 'PAQUETE', code: 'PAQ' },
  { name: 'BOLSA', code: 'BOL' },
  { name: 'CAJA', code: 'CAJ' },
  { name: 'BOTELLA', code: 'BOT' },
  { name: 'METRO', code: 'M' },
  { name: 'METRO CUADRADO', code: 'M2' },
  { name: 'METRO CÚBICO', code: 'M3' },
] as const;

export const ROTATION_CLASSIFICATIONS = [
  'BAJO',
  'MEDIO',
  'ALTO',
  'INMEDIATO',
] as const;

export const DOCUMENT_TYPES = [
  'DNI',
  'CE',
  'PASSPORT',
  'NIT',
  'RUT',
  'NIE',
  'NIF',
  'NIM',
] as const;

export const UNIQUE_CATEGORIES = [
  'Cerradura',
  'Combustible',
  'Equipo De Proteccion Personal',
  'Filtros Y Aceites',
  'Fusibles , Focos Y Cables',
  'Herramientas Manuales Y De Apoyo',
  'Implementacion De Equipos',
  'Insumos',
  'Mangueras, Soportes Y Amortiguadores',
  'Materiales Para Obra Civil',
  'Materiales Y Otros Insumos',
  'Perneria',
  'Pernos, Tuerca, Volandas Y Pintura',
  'Repuestos',
  'Seguridad',
  'Servicios Administrativos En General',
  'Servicios Generales De  Mantenimiento Y Equipos',
  'Soldadura',
  'Uniones,  Conectores Y Resortes',
  'Utiles De Escritorio',
  'Valvulas  Y Interruptor',
];

export const EMPLOYEES_POSITIONS = [
  'Sup. Mantenimiento',
  'Planner De Mantenimiento',
  'Tecnico Mecanico',
  'Ayudante Mecanico',
  'Soldador',
  'Ing. Residente',
  'Ing. Seguridad',
  'Sup. Campo',
  'Op. Minibus',
  'Op. Cisterna',
  'Op. Tractor',
] as const;

export const EMPLOYEES_AREAS = ['MANTTO', 'RUMA'] as const;
