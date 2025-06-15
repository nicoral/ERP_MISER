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
