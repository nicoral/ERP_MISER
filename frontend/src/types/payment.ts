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
}

export enum PhysicalReceipt {
  YES = 'YES',
  NO = 'NO',
}

export interface PaymentDetail {
  id: number;
  code: string;
  status: PaymentDetailStatus;
  amount: number;
  paymentReceipt?: string;
  depositDate?: Date;
  movementNumber?: string;
  receiptImage?: string;
  invoiceImage?: string;
  physicalReceipt?: PhysicalReceipt;
  purchaseDate?: Date;
  invoiceEmissionDate?: Date;
  documentNumber?: string;
  description?: string;
  retentionAmount: number;
  retentionPercentage: number;
  hasRetention: boolean;
  paymentGroup: PaymentGroup;
  createdBy: Employee;
  approvedBy?: Employee;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
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
  purchaseDate?: Date;
  invoiceEmissionDate?: Date;
  documentNumber?: string;
  description?: string;
  retentionAmount?: number;
  retentionPercentage?: number;
  hasRetention?: boolean;
  paymentGroupId: number;
}

export interface UpdatePaymentDetailDto {
  amount?: number;
  paymentReceipt?: string;
  depositDate?: Date;
  movementNumber?: string;
  receiptImage?: string;
  physicalReceipt?: PhysicalReceipt;
  purchaseDate?: Date;
  invoiceEmissionDate?: Date;
  documentNumber?: string;
  description?: string;
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
}

export interface PaymentStatistics {
  PENDING: number;
  APPROVED: number;
  PARTIAL: number;
  CANCELLED: number;
}
