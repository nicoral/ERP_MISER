import { createApiCall } from './httpInterceptor';
import type { Role } from '../../types/user';
import type { Employee } from '../../types/employee';

const BASE_URL = `${import.meta.env.VITE_API_URL}`;

export interface RoleWithDetails extends Role {
  employees: Employee[];
}

export const roleService = {
  async getRoles(): Promise<Role[]> {
    const response = await createApiCall<Role[]>(`${BASE_URL}/roles`, {
      method: 'GET',
    });
    return response;
  },

  async getRoleById(id: number): Promise<RoleWithDetails> {
    const response = await createApiCall<RoleWithDetails>(
      `${BASE_URL}/roles/${id}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async createRole(roleData: {
    name: string;
    description: string;
    permissions: number[];
  }): Promise<Role> {
    const response = await createApiCall<Role>(`${BASE_URL}/roles`, {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
    return response;
  },

  async updateRole(
    id: number,
    roleData: {
      name?: string;
      description?: string;
      permissions?: number[];
    }
  ): Promise<Role> {
    const response = await createApiCall<Role>(`${BASE_URL}/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
    return response;
  },

  async deleteRole(id: number): Promise<void> {
    await createApiCall(`${BASE_URL}/roles/${id}`, {
      method: 'DELETE',
    });
  },
};

// Legacy exports for backward compatibility
export const getRoles = roleService.getRoles;
export const getRoleById = roleService.getRoleById;
export const createRole = roleService.createRole;
export const updateRole = roleService.updateRole;
