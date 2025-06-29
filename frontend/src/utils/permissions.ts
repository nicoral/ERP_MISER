import { getCurrentUser } from '../services/auth/authService';
import type { Requirement } from '../types/requirement';

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

/**
 * Verifica si el usuario puede firmar un requerimiento según su estado y permisos
 * @param requirement - El requerimiento a verificar
 * @returns true si el usuario puede firmar, false en caso contrario
 */
export const canSignRequirement = (requirement: Requirement): boolean => {
  const user = getCurrentUser();
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  // Verificar según el estado del requerimiento
  switch (requirement.status) {
    case 'SIGNED_1':
      // Para firmar después de la primera firma, necesita requirement-view-signed2
      return (
        hasPermission('requirement-view-signed1') && !requirement.secondSignedAt
      );

    case 'SIGNED_2':
      // Para firmar después de la segunda firma, necesita requirement-view-signed3
      return (
        hasPermission('requirement-view-signed2') && !requirement.thirdSignedAt
      );

    case 'SIGNED_3':
      // Para firmar después de la tercera firma, necesita requirement-view-signed4 o similar
      // Como no hay un permiso específico para la cuarta firma, usamos requirement-view-all
      return (
        hasPermission('requirement-view-signed3') && !requirement.fourthSignedAt
      );

    default:
      return false;
  }
};

/**
 * Obtiene el texto del botón de firma según el estado del requerimiento
 * @param requirement - El requerimiento
 * @returns El texto del botón
 */
export const getSignButtonText = (requirement: Requirement): string => {
  switch (requirement.status) {
    case 'SIGNED_1':
      return 'Firmar (2da Firma)';
    case 'SIGNED_2':
      return 'Firmar (3ra Firma)';
    case 'SIGNED_3':
      return 'Firmar (4ta Firma)';
    default:
      return 'Firmar';
  }
};
