import { createApiCall } from './httpInterceptor';
import type { Permission } from '../../types/user';

interface CreatePermissionDto {
  name: string;
  module: string;
  endpoint: string;
  method: string;
  description: string;
}

interface UpdatePermissionDto {
  id: number;
  name: string;
  module: string;
  endpoint: string;
  method: string;
  description: string;
}

const BASE_URL = `${import.meta.env.VITE_API_URL}`;

export const permissionService = {
  /**
   * Obtiene todos los permisos
   */
  getAllPermissions: (): Promise<Permission[]> => {
    return createApiCall<Permission[]>(`${BASE_URL}/permissions`, {
      method: 'GET',
    });
  },

  /**
   * Obtiene un permiso por ID
   */
  getPermissionById: (id: number): Promise<Permission> => {
    return createApiCall<Permission>(`${BASE_URL}/permissions/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Crea un nuevo permiso
   */
  createPermission: (
    permissionData: CreatePermissionDto
  ): Promise<Permission> => {
    return createApiCall<Permission>(`${BASE_URL}/permissions`, {
      method: 'POST',
      body: JSON.stringify(permissionData),
    });
  },

  /**
   * Actualiza un permiso existente
   */
  updatePermission: (
    id: number,
    permissionData: UpdatePermissionDto
  ): Promise<Permission> => {
    return createApiCall<Permission>(`${BASE_URL}/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(permissionData),
    });
  },

  /**
   * Elimina un permiso
   */
  deletePermission: (id: number): Promise<void> => {
    return createApiCall<void>(`${BASE_URL}/permissions/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Obtiene permisos por módulo
   */
  getPermissionsByModule: (module: string): Promise<Permission[]> => {
    return createApiCall<Permission[]>(
      `${BASE_URL}/permissions/module/${module}`,
      {
        method: 'GET',
      }
    );
  },

  /**
   * Obtiene permisos por rol
   */
  getPermissionsByRole: (roleId: number): Promise<Permission[]> => {
    return createApiCall<Permission[]>(
      `${BASE_URL}/permissions/role/${roleId}`,
      {
        method: 'GET',
      }
    );
  },
};
