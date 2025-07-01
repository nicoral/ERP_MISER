import { createApiCall } from './httpInterceptor';
import type { AuditLog, AuditLogFilters } from '../../types/auditLog';
import type { PaginatedResponse } from '../../types/generic';

const BASE_URL = `${import.meta.env.VITE_API_URL}/audit-logs`;

export const auditLogService = {
  async getAuditLogs(
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

    const response = await createApiCall<{
      data: AuditLog[];
      total: number;
      page: number;
      limit: number;
    }>(`${BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
    });

    return {
      data: response.data,
      total: response.total,
      page: response.page,
      pageSize: response.limit,
      totalPages: Math.ceil(response.total / response.limit),
    };
  },
};

// Legacy exports for backward compatibility
export const getAuditLogs = auditLogService.getAuditLogs;
