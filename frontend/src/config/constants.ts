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
  WAREHOUSE: '/warehouse',
  WAREHOUSE_CREATE: '/warehouse/create',
  WAREHOUSE_EDIT: '/warehouse/:id/edit',
  WAREHOUSE_ARTICLES: '/warehouse/articles',
  WAREHOUSE_SERVICES: '/warehouse/services',
  WAREHOUSE_SUPPLIERS: '/warehouse/suppliers',
  PROFILE: '/profile',
} as const;
