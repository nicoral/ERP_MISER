import type { Employee } from './employee';

export interface AuditLogFilters {
  search?: string;
  userId?: number;
  date?: string;
}

export interface AuditLog {
  id: number;
  action: string;
  employee?: Employee;
  timestamp: Date;
  entity: string;
  url: string | null;
  entityId: number | null;
  oldValue: string | null;
  newValue: string | null;
  details: string | null;
}
