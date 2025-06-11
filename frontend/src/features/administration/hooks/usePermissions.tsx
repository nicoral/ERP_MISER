import { useEffect, useState } from 'react';
import type { Permission } from '../../../types/user';
import {
  getPermissions,
  getPermissionsByRole,
} from '../../../services/api/permissions';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPermissions()
      .then((permissions: Permission[]) => setPermissions(permissions))
      .catch(() => setError('Error al cargar los permisos'))
      .finally(() => setLoading(false));
  }, []);

  return { permissions, loading, error };
};

export const usePermissionsByRole = (roleId: number | null) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getPermissionsByRole(roleId)
      .then(permissions => setPermissions(permissions))
      .catch(() => setError('Error al cargar los permisos'))
      .finally(() => setLoading(false));
  }, [roleId]);

  return { permissions, loading, error };
};
