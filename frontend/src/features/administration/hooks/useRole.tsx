import { useEffect, useState } from 'react';
import type { Role } from '../../../types/user';
import { getRoleById } from '../../../services/api/roleService';

export const useRole = (id: number | undefined) => {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getRoleById(id)
      .then(role => setRole(role ?? null))
      .catch(() => setError('Error al cargar el rol'))
      .finally(() => setLoading(false));
  }, [id]);

  return { role, loading, error };
};
