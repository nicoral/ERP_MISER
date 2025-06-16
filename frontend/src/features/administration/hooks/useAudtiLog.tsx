import { useEffect, useState } from 'react';
import { getAuditLogs } from '../../../services/api/auditLog.service';
import type { AuditLog } from '../../../types/auditLog';
import type { PaginatedResponse } from '../../../types/generic';

export const useAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAuditLogs(1, 10, {})
      .then((data: PaginatedResponse<AuditLog>) => setAuditLogs(data.data))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { auditLogs, loading, error };
};
