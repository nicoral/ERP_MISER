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
  WELCOME: '/welcome',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMINISTRATION: '/administration',
  ROLES: '/roles',
  ROLE_CREATE: '/roles/create',
  ROLE_EDIT: '/roles/:id/edit',
  AUDIT_LOGS: '/audit-logs',
  EMPLOYEES: '/employees',
  EMPLOYEE_CREATE: '/employees/create',
  EMPLOYEE_EDIT: '/employees/:id/edit',
  PROCESS: '/process',
  PROCESS_REQUIREMENT: '/process/requirement',
  WAREHOUSE: '/warehouse',
  WAREHOUSE_CREATE: '/warehouse/create',
  WAREHOUSE_EDIT: '/warehouse/:id/edit',
  ARTICLES: '/articles',
  ARTICLE_CREATE: '/articles/create',
  ARTICLE_EDIT: '/articles/:id/edit',
  SERVICES: '/services',
  SUPPLIERS: '/suppliers',
  SUPPLIERS_CREATE: '/suppliers/create',
  SUPPLIERS_EDIT: '/suppliers/:id/edit',
  PROFILE: '/profile',
  COST_CENTER: '/cost-center',
  COST_CENTER_CREATE: '/cost-center/create',
  COST_CENTER_EDIT: '/cost-center/:id/edit',
  COST_CENTER_DETAILS: '/cost-center/:id/details',
  REQUIREMENTS: '/requirements',
  REQUIREMENTS_DETAILS: '/requirements/:id/details',
  REQUIREMENTS_CREATE: '/requirements/create',
  REQUIREMENT_EDIT: '/requirements/:id/edit',
  GENERAL_SETTINGS: '/general-settings',
} as const;

export const MODULES = [
  {
    key: 'administration',
    label: 'Administración',
  },
  {
    key: 'roles',
    label: 'Roles',
  },
  {
    key: 'employee',
    label: 'Empleados',
  },
  {
    key: 'warehouses',
    label: 'Almacenes',
  },
  {
    key: 'articles',
    label: 'Artículos',
  },
  {
    key: 'cost_centers',
    label: 'Centros de costo',
  },
  {
    key: 'suppliers',
    label: 'Proveedores',
  },
  {
    key: 'requirements',
    label: 'Requerimientos',
  },
];

export const ADVANCED_MODULES = [
  {
    key: 'advanced',
    label: 'Configuración Avanzada',
  },
];

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

export const EMPLOYEES_AREAS = [
  'RUMA',
  'CONTABILIDAD',
  'RRHH',
  'FINANZAS',
  'HSE',
  'GERENCIA',
  'PROYECTOS',
  'LOGISTICA',
  'VIGILANCIA',
  'TRANSPORTE',
] as const;

export const PRIORITIES = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
];
