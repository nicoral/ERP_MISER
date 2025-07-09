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

export interface PurchaseOrderSigner {
  name: string;
  date: string;
}

export interface PurchaseOrderSignature {
  signature: string;
  signedAt: string;
}
