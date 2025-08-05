import type { QuotationRequest, FinalSelection } from '../../types/quotation';
import type { Supplier } from '../../types/supplier';
import type { SupplierQuotationItem } from '../../types/quotation';
import type { Service } from '../../types/service';

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

export interface SelectedService {
  id: number;
  service: Service;
  duration?: number;
  durationType?: string;
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
  signedBy?: number;
  signedAt?: Date;
}

// Props para ComparisonTable
export interface ComparisonTableProps {
  quotation: QuotationRequest;
  selectedSupplierId: number | null;
  type: string;
  relevantSuppliers: RelevantSupplier[];
  selectedArticles: SelectedArticle[];
  selectedServices: SelectedService[];
  suppliersWithFinalSelection: SupplierWithFinalSelection[];
  finalSelection: FinalSelection | null;
  signatures: Signature[];
}

// Props para PurchaseOrder
export interface PurchaseOrderProps {
  quotation: QuotationRequest;
  selectedSupplierId: number | null;
  type: string;
  signatures: Signature[];
  onGeneratePurchaseOrder?: (paymentMethod: string) => void;
  isGenerating?: boolean;
}
