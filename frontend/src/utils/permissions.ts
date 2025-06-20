import { getCurrentUser } from '../services/auth/authService';

/**
 * Verifica si el usuario actual tiene el permiso especificado
 * @param permission - El permiso a verificar
 * @returns true si el usuario tiene el permiso, false en caso contrario
 */
export const hasPermission = (permission: string): boolean => {
  const user = getCurrentUser();
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  return user.role.permissions.some(p => p.name === permission);
};

/**
 * Verifica si el usuario actual tiene al menos uno de los permisos especificados
 * @param permissions - Array de permisos a verificar
 * @returns true si el usuario tiene al menos uno de los permisos, false en caso contrario
 */
export const hasAnyPermission = (permissions: string[]): boolean => {
  const user = getCurrentUser();
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  return permissions.some(permission =>
    user.role.permissions.some(p => p.name === permission)
  );
};

/**
 * Verifica si el usuario actual tiene todos los permisos especificados
 * @param permissions - Array de permisos a verificar
 * @returns true si el usuario tiene todos los permisos, false en caso contrario
 */
export const hasAllPermissions = (permissions: string[]): boolean => {
  const user = getCurrentUser();
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  return permissions.every(permission =>
    user.role.permissions.some(p => p.name === permission)
  );
};
