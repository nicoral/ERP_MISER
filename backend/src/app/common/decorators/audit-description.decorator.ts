import { SetMetadata } from '@nestjs/common';

export const AUDIT_DESCRIPTION_KEY = 'audit_description';

export const AuditDescription = (description: string) =>
  SetMetadata(AUDIT_DESCRIPTION_KEY, description); 