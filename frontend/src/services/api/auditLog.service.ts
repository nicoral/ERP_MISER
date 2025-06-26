import { STORAGE_KEY_TOKEN } from '../../config/constants';
import type { AuditLog, AuditLogFilters } from '../../types/auditLog';
import type { PaginatedResponse } from '../../types/generic';

export async function getAuditLogs(
  page: number = 1,
  pageSize: number = 10,
  filters?: AuditLogFilters
): Promise<PaginatedResponse<AuditLog>> {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', pageSize.toString());
  if (filters?.search) {
    queryParams.append('search', filters.search);
  }
  if (filters?.userId) {
    queryParams.append('userId', filters.userId.toString());
  }
  if (filters?.date) {
    queryParams.append('date', filters.date);
  }
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/audit-logs?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(STORAGE_KEY_TOKEN)}`,
      },
    }
  );
  const data = await response.json();
  if (response.status === 200) {
    return {
      data: data.data,
      total: data.total,
      page: data.page,
      pageSize: data.limit,
      totalPages: Math.ceil(data.total / data.limit),
    };
  }
  throw new Error(data.message);
}
