import { createApiCall } from './httpInterceptor';
import type { Permission } from '../../types/user';

const BASE_URL = `${import.meta.env.VITE_API_URL}`;

export const permissionsService = {
  async getPermissions(): Promise<Permission[]> {
    const response = await createApiCall<Permission[]>(
      `${BASE_URL}/permissions`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async getPermissionsByRole(roleId: number | null): Promise<Permission[]> {
    if (!roleId) return [];
    const response = await createApiCall<{ permissions: Permission[] }>(
      `${BASE_URL}/roles/${roleId}`,
      {
        method: 'GET',
      }
    );
    return response.permissions;
  },
};

// Legacy exports for backward compatibility
export const getPermissions = permissionsService.getPermissions;
export const getPermissionsByRole = permissionsService.getPermissionsByRole;
