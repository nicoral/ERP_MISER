import type { PurchaseOrder } from './purchaseOrder';

export enum PaymentDetailStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  WITH_RECEIPT_NO_INVOICES = 'WITH_RECEIPT_NO_INVOICES', // Nuevo estado
}

export enum PhysicalReceipt {
  YES = 'YES',
  NO = 'NO',
}

export interface PaymentInvoice {
  id: number;
  code: string;
  invoiceImage?: string;
  purchaseDate?: Date;
  invoiceEmissionDate?: Date;
  documentNumber?: string;
  description?: string;
  amount: number;
  retentionAmount: number;
  retentionPercentage: number;
  hasRetention: boolean;
  paymentDetail: PaymentDetail;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface PaymentDetail {
  id: number;
  code: string;
  status: PaymentDetailStatus;
  amount: number;
  paymentReceipt?: string;
  depositDate?: string;
  movementNumber?: string;
  receiptImage?: string;
  retentionDocument?: string; // Documento de retención
  physicalReceipt?: PhysicalReceipt;
  description?: string;
  rejectionReason?: string;
  paymentGroup: PaymentGroup;
  createdBy: Employee;
  approvedBy?: Employee;
  invoices?: PaymentInvoice[];
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentGroup {
  id: number;
  code: string;
  status: PaymentStatus;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  description?: string;
  notes?: string;
  purchaseOrder: PurchaseOrder;
  createdBy: Employee;
  approvedBy?: Employee;
  paymentDetails: PaymentDetail[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreatePaymentDetailDto {
  code: string;
  amount: number;
  paymentReceipt?: string;
  depositDate?: Date;
  movementNumber?: string;
  receiptImage?: string;
  physicalReceipt?: PhysicalReceipt;
  description?: string;
  paymentGroupId: number;
}

export interface UpdatePaymentDetailDto {
  amount?: number;
  paymentReceipt?: string;
  depositDate?: Date;
  movementNumber?: string;
  receiptImage?: string;
  retentionDocument?: string; // Documento de retención
  physicalReceipt?: PhysicalReceipt;
  description?: string;
}

export interface UpdatePaymentDetailReceiptDto {
  paymentReceipt?: string;
  depositDate?: string;
  movementNumber?: string;
  receiptImage?: string;
  retentionDocument?: string; // Documento de retención
  physicalReceipt?: PhysicalReceipt;
  description?: string;
}

export interface CreatePaymentInvoiceDto {
  code: string;
  description?: string;
  amount: number;
  documentNumber?: string;
  purchaseDate?: string;
  invoiceEmissionDate?: string;
  invoiceImage?: string;
  retentionAmount?: number;
  retentionPercentage?: number;
  hasRetention?: boolean;
  paymentDetailId: number;
}

export interface UpdatePaymentInvoiceDto {
  description?: string;
  amount?: number;
  documentNumber?: string;
  purchaseDate?: string;
  invoiceEmissionDate?: string;
  invoiceImage?: string;
  retentionAmount?: number;
  retentionPercentage?: number;
  hasRetention?: boolean;
}

export interface PaymentFilters {
  status?: PaymentDetailStatus;
  search?: string;
  createdBy?: number;
  approvedBy?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaymentGroupFilters {
  status?: PaymentStatus;
  search?: string;
  createdBy?: number;
  approvedBy?: number;
  dateFrom?: string;
  dateTo?: string;
  hasReceiptNoInvoices?: boolean; // Nuevo filtro
}

export interface PaymentStatistics {
  PENDING: number;
  APPROVED: number;
  PARTIAL: number;
  CANCELLED: number;
  WITH_RECEIPT_NO_INVOICES: number; // Pagos con comprobante pero sin facturas
}

export interface InvoiceStatistics {
  totalAmount: number;
  totalRetentionAmount: number;
  invoiceCount: number;
}
