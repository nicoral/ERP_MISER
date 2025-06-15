import { useEffect, useState } from 'react';
import { getRoles } from '../../../services/api/roleService';
import type { Role } from '../../../types/user';

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al obtener los roles'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);
  return { roles, loading, error };
};
