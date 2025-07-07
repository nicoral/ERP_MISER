import { PaymentDetailStatus, PaymentStatus } from '../types/payment';

export const getPaymentDetailStatusColor = (
  status: PaymentDetailStatus
): string => {
  switch (status) {
    case PaymentDetailStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case PaymentDetailStatus.APPROVED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case PaymentDetailStatus.REJECTED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case PaymentDetailStatus.CANCELLED:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const getPaymentDetailStatusText = (
  status: PaymentDetailStatus
): string => {
  switch (status) {
    case PaymentDetailStatus.PENDING:
      return '⏳ Pendiente';
    case PaymentDetailStatus.APPROVED:
      return '✅ Aprobado';
    case PaymentDetailStatus.REJECTED:
      return '❌ Rechazado';
    case PaymentDetailStatus.CANCELLED:
      return '🚫 Cancelado';
    default:
      return 'Desconocido';
  }
};

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case PaymentStatus.PARTIAL:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case PaymentStatus.COMPLETED:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case PaymentStatus.CANCELLED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export const getPaymentStatusText = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return '⏳ Pendiente';
    case 'PARTIAL':
      return '💰 Parcial';
    case 'COMPLETED':
      return '✅ Completado';
    case 'CANCELLED':
      return '🚫 Cancelado';
    default:
      return status;
  }
};

export const formatCurrency = (
  amount: number,
  currency: string = 'PEN'
): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const calculatePaymentProgress = (
  paidAmount: number,
  totalAmount: number
): number => {
  if (totalAmount === 0) return 0;
  return Math.round((paidAmount / totalAmount) * 100);
};

export const canApprovePayment = (status: PaymentDetailStatus): boolean => {
  return status === PaymentDetailStatus.PENDING;
};

export const canRejectPayment = (status: PaymentDetailStatus): boolean => {
  return status === PaymentDetailStatus.PENDING;
};

export const canEditPayment = (status: PaymentDetailStatus): boolean => {
  return status === PaymentDetailStatus.PENDING;
};

export const getPaymentStepTitle = (step: number): string => {
  switch (step) {
    case 0:
      return 'Selección de Proveedores';
    case 1:
      return 'Información de Pagos';
    default:
      return '';
  }
};

export const getPaymentStepDescription = (step: number): string => {
  switch (step) {
    case 0:
      return 'Selecciona los proveedores de la selección final';
    case 1:
      return 'Completa la información de boletas y facturas';
    default:
      return '';
  }
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'Pendiente';
    case PaymentStatus.PARTIAL:
      return 'Parcial';
    case PaymentStatus.COMPLETED:
      return 'Completado';
    case PaymentStatus.CANCELLED:
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};
