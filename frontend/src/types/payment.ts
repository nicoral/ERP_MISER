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
  supplier: Supplier;
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
  quotationRequest: QuotationRequest;
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
  // ... otros campos del empleado
}

export interface QuotationRequest {
  id: number;
  code: string;
  status: string;
  finalSelection?: FinalSelection;
  // ... otros campos de la cotización
}

export interface FinalSelection {
  id: number;
  notes?: string;
  totalAmount: number;
  status: string;
  purchaseOrderNumber?: string;
  finalSelectionItems: FinalSelectionItem[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface FinalSelectionItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  deliveryTime?: number;
  notes?: string;
  supplier: Supplier;
  requirementArticle: RequirementArticle;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Supplier {
  id: number;
  businessName: string;
  ruc: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface RequirementArticle {
  id: number;
  quantity: number;
  unitPrice: number;
  article: Article;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Article {
  id: number;
  code: string;
  name: string;
  description?: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// DTOs para crear y actualizar
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
  supplierId: number;
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
