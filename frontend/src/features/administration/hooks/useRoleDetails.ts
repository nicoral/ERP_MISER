import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { Role, Permission } from '../../../types/user';
import {
  roleService,
  type RoleWithDetails,
} from '../../../services/api/roleService';

export const useRoleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState<RoleWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoleDetails = useCallback(async () => {
    if (!id) {
      setError('ID de rol no proporcionado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const roleData = await roleService.getRoleById(parseInt(id));
      setRole(roleData);
    } catch (err) {
      setError('Error al cargar los detalles del rol');
      console.error('Error fetching role details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoleDetails();
  }, [fetchRoleDetails]);

  // Función para verificar permisos del rol
  const hasRolePermission = (role: Role, module: string, action: string) => {
    return role.permissions.some(
      (perm: Permission) =>
        perm.module?.toLowerCase() === module.toLowerCase() &&
        perm.name?.toLowerCase().includes(action.toLowerCase())
    );
  };

  // Función para actualizar el rol de un empleado
  const updateEmployeeRole = async (employeeId: number, newRoleId: number) => {
    try {
      console.log('updateEmployeeRole', employeeId, newRoleId);
      // Aquí implementarías la llamada a la API para actualizar el rol del empleado
      // Por ahora solo actualizamos el estado local
      if (role) {
        setRole(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            employees: prev.employees.filter(emp => emp.id !== employeeId),
          };
        });
      }
      return true;
    } catch (error) {
      console.error('Error updating employee role:', error);
      return false;
    }
  };

  return {
    role,
    employees: role?.employees || [],
    loading,
    error,
    hasRolePermission,
    updateEmployeeRole,
    refetch: fetchRoleDetails,
  };
};
