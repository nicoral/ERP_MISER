import {
  QuotationItemStatus,
  QuotationStep,
  QuotationSupplierStatus,
} from '../types/quotation';
import type {
  QuotationRequest,
  SupplierQuotationItem,
  QuotationComparison,
  SupplierQuote,
} from '../types/quotation';

// Helper functions for quotation calculations and data processing

export const calculateQuotationTotal = (
  items: SupplierQuotationItem[]
): number => {
  return items
    .filter(item => item.status === QuotationItemStatus.QUOTED)
    .reduce((total, item) => total + (item.totalPrice || 0), 0);
};

export const getQuotationStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'DRAFT':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'ACTIVE':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';

    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'SIGNED_1':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'SIGNED_2':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'SIGNED_3':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'APPROVED':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const getQuotationStatusText = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return '⏳ Pendiente';
    case 'DRAFT':
      return '📝 Borrador';
    case 'ACTIVE':
      return '🔄 Activo';

    case 'CANCELLED':
      return '❌ Cancelado';
    case 'SIGNED_1':
      return '✍️ Firmado (Logística)';
    case 'SIGNED_2':
      return '✍️ Firmado (Of. Técnica)';
    case 'SIGNED_3':
      return '✍️ Firmado (Administración)';
    case 'APPROVED':
      return '✅ Aprobado';
    case 'REJECTED':
      return '❌ Rechazado';
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

export const generateQuotationComparisons = (
  quotationRequest: QuotationRequest
): QuotationComparison[] => {
  const comparisons: QuotationComparison[] = [];

  // Get all articles from the requirement
  const articles = quotationRequest.requirement.requirementArticles;

  articles.forEach(requirementArticle => {
    const article = requirementArticle.article;
    const supplierQuotes: SupplierQuote[] = [];

    // Get quotes from all suppliers for this article
    quotationRequest.quotationSuppliers.forEach(quotationSupplier => {
      const supplierQuotation = quotationSupplier.supplierQuotation;
      if (supplierQuotation) {
        const item = supplierQuotation.supplierQuotationItems.find(
          item => item.requirementArticle.article.id === article.id
        );

        if (item) {
          supplierQuotes.push({
            supplierId: quotationSupplier.supplier.id,
            supplier: quotationSupplier.supplier,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
            currency: item.currency,
            deliveryTime: item.deliveryTime,
            isBestPrice: false,
            status: item.status,
            reasonNotAvailable: item.reasonNotAvailable,
          });
        }
      }
    });

    // Find best price
    const quotedItems = supplierQuotes.filter(
      quote => quote.status === QuotationItemStatus.QUOTED
    );
    if (quotedItems.length > 0) {
      const bestPrice = quotedItems.reduce((min, current) =>
        current.unitPrice < min.unitPrice ? current : min
      );
      bestPrice.isBestPrice = true;
    }

    comparisons.push({
      articleId: article.id,
      article: article,
      quantity: requirementArticle.quantity,
      supplierQuotes,
      bestPrice:
        quotedItems.length > 0
          ? quotedItems.reduce((min, current) =>
              current.unitPrice < min.unitPrice ? current : min
            )
          : undefined,
    });
  });

  return comparisons;
};

export const canProceedToNextStep = (
  currentStep: number,
  quotationRequest: QuotationRequest
): boolean => {
  switch (currentStep) {
    case 0: // Supplier Selection
      return quotationRequest.quotationSuppliers.length > 0;
    case 1: // Generate Orders
      return quotationRequest.quotationSuppliers.some(
        qs => qs.status === 'SENT'
      );
    case 2: // Receive Quotations
      return quotationRequest.quotationSuppliers.some(
        qs => qs.supplierQuotation
      );
    case 3: // Compare Quotations
      return quotationRequest.quotationSuppliers.some(
        qs => qs.supplierQuotation?.status === 'SUBMITTED'
      );
    case 4: // Final Selection
      return quotationRequest.finalSelection !== null;
    default:
      return false;
  }
};

export const getCurrentStepFromQuotation = (
  quotationRequest: QuotationRequest
): QuotationStep => {
  // Si no tiene proveedores, está en selección de proveedores
  if (quotationRequest.quotationSuppliers.length === 0) {
    return QuotationStep.SUPPLIER_SELECTION;
  }

  // Si tiene proveedores pero no se enviaron todas las órdenes
  const hasNotAllSentOrders = quotationRequest.quotationSuppliers.some(
    qs => qs.status !== QuotationSupplierStatus.SENT
  );
  if (hasNotAllSentOrders) {
    return QuotationStep.GENERATE_ORDERS;
  }

  // Si tiene órdenes enviadas pero no todos los proveedores tienen cotizaciones recibidas
  const allSuppliersHaveQuotations = quotationRequest.quotationSuppliers.every(
    qs => qs.supplierQuotation
  );
  if (!allSuppliersHaveQuotations) {
    return QuotationStep.RECEIVE_QUOTATIONS;
  }

  // Si todos tienen cotizaciones pero no todas están enviadas
  const allQuotationsSubmitted = quotationRequest.quotationSuppliers.every(
    qs => qs.supplierQuotation?.status === 'SUBMITTED'
  );
  if (!allQuotationsSubmitted) {
    return QuotationStep.RECEIVE_QUOTATIONS;
  }

  // Si todas las cotizaciones están enviadas pero no hay selección final
  if (quotationRequest.finalSelection === null) {
    return QuotationStep.COMPARE_QUOTATIONS;
  }

  // Si tiene selección final, está en el último paso
  return QuotationStep.FINAL_SELECTION;
};

export const getQuotationStepTitle = (step: number): string => {
  const titles = [
    'Selección de Proveedores',
    'Generar Órdenes',
    'Recibir Cotizaciones',
    'Comparar Cotizaciones',
    'Selección Final',
  ];
  return titles[step] || 'Paso Desconocido';
};

export const getQuotationStepDescription = (step: number): string => {
  const descriptions = [
    'Selecciona los proveedores que recibirán la solicitud de cotización',
    'Genera y envía las órdenes de cotización a los proveedores seleccionados',
    'Ingresa las cotizaciones recibidas de los proveedores',
    'Compara las cotizaciones y analiza las mejores opciones',
    'Realiza la selección final de productos y proveedores',
  ];
  return descriptions[step] || '';
};
