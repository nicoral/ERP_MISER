import type { Employee } from './employee';
import type { QuotationRequest } from './quotation';
import type { Supplier } from './supplier';
import type { Requirement } from './requirement';
import type { CostCenter } from './costCenter';

export interface PurchaseOrderItem {
  item: number;
  code: string;
  quantity: number;
  unit: string;
  description: string;
  brand: string;
  unitPrice: string;
  amount: string;
  currency: string;
  type: 'ARTICLE' | 'SERVICE';
  duration?: number;
  durationType?: string;
}

export interface PurchaseOrder {
  id: number;
  code: string;
  orderNumber: string;
  issueDate: Date;
  buyerName: string;
  buyerRUC: string;
  buyerAddress: string;
  buyerLocation?: string;
  buyerPhone?: string;
  supplierName: string;
  supplierRUC: string;
  supplierAddress: string;
  supplierLocation?: string;
  supplierPhone?: string;
  items: PurchaseOrderItem[];
  paymentMethod?: string;
  deliveryDate: string;
  subtotal: number;
  igv?: number;
  total: number;
  currency: string;
  observation?: string;
  quotationRequest: QuotationRequest;
  supplier: Supplier;
  createdBy?: Employee;
  requirement?: Requirement;
  costCenterEntity?: CostCenter;
  firstSignature?: string;
  firstSignedBy?: number;
  firstSignedAt?: Date;
  secondSignature?: string;
  secondSignedBy?: number;
  secondSignedAt?: Date;
  thirdSignature?: string;
  thirdSignedBy?: number;
  thirdSignedAt?: Date;
  fourthSignature?: string;
  fourthSignedBy?: number;
  fourthSignedAt?: Date;
  rejectedReason?: string;
  rejectedBy?: number;
  rejectedAt?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
