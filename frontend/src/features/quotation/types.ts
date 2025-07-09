import type { QuotationRequest, FinalSelection } from '../../types/quotation';
import type { Supplier } from '../../types/supplier';
import type { SupplierQuotationItem } from '../../types/quotation';
import type { Employee } from '../../types/employee';

// Tipos para el componente ComparisonTable
export interface RelevantSupplier {
  supplier: Supplier;
  supplierQuotation?: {
    quotationNumber?: string;
    receivedAt?: Date;
    supplierQuotationItems?: SupplierQuotationItem[];
    notes?: string;
  };
  terms?: string;
}

export interface SelectedArticle {
  id: number;
  article: {
    id: number;
    name: string;
    code: string;
    unitOfMeasure: string;
  };
  quantity: number;
}

export interface SupplierWithFinalSelection {
  id: number;
  businessName: string;
  ruc: string;
  address?: string;
}

export interface Signature {
  label: string;
  signed: boolean;
  signedBy?: Employee;
  signedAt?: Date;
}

// Props para ComparisonTable
export interface ComparisonTableProps {
  quotation: QuotationRequest;
  selectedSupplierId: number | null;
  relevantSuppliers: RelevantSupplier[];
  selectedArticles: SelectedArticle[];
  suppliersWithFinalSelection: SupplierWithFinalSelection[];
  finalSelection: FinalSelection | null;
  signatures: Signature[];
}

// Props para PurchaseOrder
export interface PurchaseOrderProps {
  quotation: QuotationRequest;
  selectedSupplierId: number | null;
  signatures: Signature[];
  onGeneratePurchaseOrder?: (paymentMethod: string) => void;
  isGenerating?: boolean;
}
