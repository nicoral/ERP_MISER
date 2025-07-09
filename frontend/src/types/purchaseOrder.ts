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
  quotationRequest: {
    id: number;
  };
  supplier: {
    id: number;
  };
  createdBy?: {
    id: number;
  };
  requirement?: {
    id: number;
  };
  costCenterEntity?: {
    id: number;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
