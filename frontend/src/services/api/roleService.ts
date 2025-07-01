import { createApiCall } from './httpInterceptor';
import type { CreateRole, Role, UpdateRole } from '../../types/user';

const BASE_URL = `${import.meta.env.VITE_API_URL}/roles`;

export const roleService = {
  async getRoles(): Promise<Role[]> {
    const response = await createApiCall<Role[]>(BASE_URL, {
      method: 'GET',
    });
    return response;
  },

  async getRoleById(id: number): Promise<Role> {
    const response = await createApiCall<Role>(`${BASE_URL}/${id}`, {
      method: 'GET',
    });
    return response;
  },

  async createRole(role: CreateRole): Promise<Role> {
    const response = await createApiCall<Role>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(role),
    });
    return response;
  },

  async updateRole(id: number, role: UpdateRole): Promise<Role> {
    const response = await createApiCall<Role>(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(role),
    });
    return response;
  },
};

// Legacy exports for backward compatibility
export const getRoles = roleService.getRoles;
export const getRoleById = roleService.getRoleById;
export const createRole = roleService.createRole;
export const updateRole = roleService.updateRole;
