export const REQUIREMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  SIGNED_1: 'Firmado por solicitante',
  SIGNED_2: 'Firmado por oficina técnica',
  SIGNED_3: 'Firmado por administración',
  APPROVED: 'Aprobado',
  CANCELLED: 'Cancelado',
  REJECTED: 'Rechazado',
};

export const getRequirementStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'SIGNED_1':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'SIGNED_2':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'SIGNED_3':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'APPROVED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const getRequirementStatusText = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return '⏳ Pendiente';
    case 'SIGNED_1':
      return '✍️ Firmado (Solicitante)';
    case 'SIGNED_2':
      return '✍️ Firmado (Of. Técnica)';
    case 'SIGNED_3':
      return '✍️ Firmado (Administración)';
    case 'APPROVED':
      return '✅ Aprobado';
    case 'CANCELLED':
      return '❌ Cancelado';
    case 'REJECTED':
      return '❌ Rechazado';
    default:
      return status;
  }
};
