import type { Supplier } from './supplier';
import type { Requirement } from './requirement';
import type { Article } from './article';
import type { Employee } from './employee';

// Enums from backend entities
export enum QuotationRequestStatus {
  PENDING = 'PENDING',
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  SIGNED_1 = 'SIGNED_1',
  SIGNED_2 = 'SIGNED_2',
  SIGNED_3 = 'SIGNED_3',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum QuotationSupplierStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  RESPONDED = 'RESPONDED',
  CANCELLED = 'CANCELLED',
}

export enum SupplierQuotationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum QuotationItemStatus {
  QUOTED = 'QUOTED',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  NOT_QUOTED = 'NOT_QUOTED',
}

export enum FinalSelectionStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  GENERATED = 'GENERATED',
}

// Main entities matching backend
export interface QuotationRequest {
  id: number;
  code: string;
  status: QuotationRequestStatus;
  deadline?: Date;
  notes?: string;
  progress: number;
  requirement: Requirement;
  createdBy: Employee;
  quotationSuppliers: QuotationSupplier[];
  finalSelection: FinalSelection;
  // Approval flow fields
  firstSignedBy?: Employee;
  secondSignedBy?: Employee;
  thirdSignedBy?: Employee;
  fourthSignedBy?: Employee;
  firstSignedAt?: Date;
  secondSignedAt?: Date;
  thirdSignedAt?: Date;
  fourthSignedAt?: Date;
  rejectedBy?: Employee;
  rejectedAt?: Date;
  rejectedReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface QuotationSupplier {
  id: number;
  status: QuotationSupplierStatus;
  orderNumber: string;
  terms?: string;
  sentAt?: Date;
  quotationRequest: QuotationRequest;
  supplier: Supplier;
  quotationSupplierArticles: QuotationSupplierArticle[];
  supplierQuotation?: SupplierQuotation;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface QuotationSupplierArticle {
  id: number;
  quantity: number;
  quotationSupplier: QuotationSupplier;
  requirementArticle: RequirementArticle;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface SupplierQuotation {
  id: number;
  quotationNumber?: string;
  receivedAt: Date;
  validUntil: Date;
  currency: string;
  totalAmount: number;
  status: SupplierQuotationStatus;
  notes?: string;
  methodOfPayment?: string;
  igv?: string;
  quotationSupplier: QuotationSupplier;
  supplierQuotationItems: SupplierQuotationItem[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface SupplierQuotationItem {
  id: number;
  status: QuotationItemStatus;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  currency: string;
  deliveryTime?: number;
  notes?: string;
  reasonNotAvailable?: string;
  supplierQuotation: SupplierQuotation;
  requirementArticle: RequirementArticle;
  finalSelectionItems: FinalSelectionItem[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface FinalSelection {
  id: number;
  notes?: string;
  totalAmount: number;
  status: FinalSelectionStatus;
  purchaseOrderNumber?: string;
  quotationRequest: QuotationRequest;
  createdBy: Employee;
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
  finalSelection: FinalSelection;
  requirementArticle: RequirementArticle;
  supplier: Supplier;
  supplierQuotationItem: SupplierQuotationItem;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// DTOs for API requests
export interface CreateQuotationRequestDto {
  requirementId: number;
  suppliers?: Array<{ supplierId: number }>;
  supplierArticles?: Array<{ requirementArticleId: number; quantity: number }>;
  deadline?: Date;
  notes?: string;
}

export interface UpdateQuotationRequestDto {
  suppliers?: Array<{ supplierId: number }>;
  supplierArticles?: Array<{ requirementArticleId: number; quantity: number }>;
  deadline?: Date;
  notes?: string;
}

export interface CreateSupplierQuotationDto {
  quotationRequestId: number;
  supplierId: number;
  notes?: string;
  items: Array<{
    articleId: number;
    quantity: number;
    unitPrice?: number;
    deliveryTime?: number;
    notes?: string;
    status?: string;
    reasonNotAvailable?: string;
    currency?: string;
  }>;
}

export interface UpdateSupplierQuotationDto {
  notes?: string;
  methodOfPayment?: string;
  igv?: string;
  items: Array<{
    id: number;
    unitPrice?: number;
    deliveryTime?: number;
    notes?: string;
    status?: string;
    reasonNotAvailable?: string;
    currency?: string;
  }>;
}

export interface CreateFinalSelectionDto {
  quotationRequestId: string;
  notes?: string;
  items: Array<{
    articleId: string;
    supplierId: string;
    selectedPrice: number;
    notes?: string;
  }>;
}

export interface UpdateSupplierQuotationOcDto {
  methodOfPayment: string;
  igv: string;
}

export interface UpdateFinalSelectionDto {
  notes?: string;
  items?: Array<{
    id: string;
    supplierId: number;
    selectedPrice?: number;
    notes?: string;
  }>;
}

export interface UpdateQuotationBasicDto {
  deadline?: Date;
  notes?: string;
}

export interface UpdateQuotationOrderDto {
  supplierId: number;
  orderNumber?: string;
  terms?: string;
  selectedArticles?: number[];
}

export interface SendQuotationOrderDto {
  supplierId: number;
  orderNumber?: string;
  terms?: string;
}

export interface ApplyGeneralTermsDto {
  terms: string;
  deadline?: Date;
  selectedArticles?: {
    articleId: number;
    quantity: number;
  }[];
}

// Extended RequirementArticle type for quotation context
export interface RequirementArticle {
  id: number;
  requirement: Requirement;
  article: Article;
  quantity: number;
  unitPrice: number;
  justification?: string;
  currency: string;
  supplierQuotationItems: SupplierQuotationItem[];
  quotationSupplierArticles: QuotationSupplierArticle[];
  finalSelectionItems: FinalSelectionItem[];
}

// Frontend specific types for wizard
export enum QuotationStep {
  SUPPLIER_SELECTION = 0,
  GENERATE_ORDERS = 1,
  RECEIVE_QUOTATIONS = 2,
  COMPARE_QUOTATIONS = 3,
  FINAL_SELECTION = 4,
}

export interface QuotationFilters {
  status?: QuotationRequestStatus;
  supplierId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface QuotationComparison {
  articleId: number;
  article: Article;
  quantity: number;
  supplierQuotes: SupplierQuote[];
  bestPrice?: SupplierQuote;
}

export interface SupplierQuote {
  supplierId: number;
  supplier: Supplier;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  deliveryTime?: number;
  isBestPrice: boolean;
  status: QuotationItemStatus;
  reasonNotAvailable?: string;
}

// Types for wizard components
export interface SelectedSupplier {
  supplier: Supplier;
  isSelected: boolean;
  quotationOrder?: QuotationOrder;
  receivedQuotation?: ReceivedQuotation;
  isFinalSelected?: boolean;
}

export interface QuotationOrder {
  id: number;
  supplierId: number;
  requirementId: number;
  orderNumber: string;
  terms: string;
  deadline: Date;
  status: QuotationSupplierStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceivedQuotation {
  id: number;
  supplierId: number;
  requirementId: number;
  receivedAt: Date;
  validUntil: Date;
  items: ReceivedQuotationItem[];
  totalAmount: number;
  currency?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PENDING';
  notes?: string;
  updatedAt?: Date;
}

export interface ReceivedQuotationItem {
  id: number;
  requirementArticleId?: number;
  article: Article;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  deliveryTime: number;
  notes: string;
  status: QuotationItemStatus;
  reasonNotAvailable: string;
}

export interface ProductSelection {
  articleId: number;
  requirementArticleId: number;
  article: Article;
  quantity: number;
  selectedSupplierId: number;
  selectedSupplier: Supplier;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  deliveryTime?: number;
  notes?: string;
}

// Wizard state types
export interface QuotationWizardState {
  requirement: Requirement;
  selectedSuppliers: SelectedSupplier[];
  currentStep: QuotationStep;
}
