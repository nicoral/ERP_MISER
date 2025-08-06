import { useState, useEffect } from 'react';
import { permissionService } from '../../../services/api/permissionService';
import type { Permission } from '../../../types/user';

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

export const usePermissionManagement = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
    } catch (err) {
      setError('Error al cargar los permisos');
      console.error('Error loading permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPermission = async (permissionData: CreatePermissionDto) => {
    setLoading(true);
    setError(null);
    try {
      const newPermission =
        await permissionService.createPermission(permissionData);
      setPermissions(prev => [...prev, newPermission]);
      return newPermission;
    } catch (err) {
      setError('Error al crear el permiso');
      console.error('Error creating permission:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (permissionData: UpdatePermissionDto) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPermission = await permissionService.updatePermission(
        permissionData.id,
        permissionData
      );
      setPermissions(prev =>
        prev.map(permission =>
          permission.id === permissionData.id ? updatedPermission : permission
        )
      );
      return updatedPermission;
    } catch (err) {
      setError('Error al actualizar el permiso');
      console.error('Error updating permission:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePermission = async (permissionId: number) => {
    setLoading(true);
    setError(null);
    try {
      await permissionService.deletePermission(permissionId);
      setPermissions(prev =>
        prev.filter(permission => permission.id !== permissionId)
      );
    } catch (err) {
      setError('Error al eliminar el permiso');
      console.error('Error deleting permission:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  return {
    permissions,
    loading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    loadPermissions,
  };
};
