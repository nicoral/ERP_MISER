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
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getQuotationStatusText = (status: string): string => {
  switch (status) {
    case 'DRAFT':
      return 'Borrador';
    case 'ACTIVE':
      return 'Activo';
    case 'COMPLETED':
      return 'Completado';
    case 'CANCELLED':
      return 'Cancelado';
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

export const getQuotationProgress = (
  quotationRequest: QuotationRequest
): number => {
  const steps = [
    quotationRequest.quotationSuppliers.length > 0, // Step 1: Suppliers selected
    quotationRequest.quotationSuppliers.some(qs => qs.status === 'SENT'), // Step 2: Orders sent
    quotationRequest.quotationSuppliers.some(qs => qs.supplierQuotation), // Step 3: Quotations received
    quotationRequest.quotationSuppliers.some(
      qs => qs.supplierQuotation?.status === 'SUBMITTED'
    ), // Step 4: Quotations compared
    quotationRequest.finalSelections.length > 0, // Step 5: Final selection made
  ];

  const completedSteps = steps.filter(Boolean).length;
  return (completedSteps / 5) * 100;
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
      return quotationRequest.finalSelections.length > 0;
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

  // Si tiene proveedores pero si no se enviaron todas las órdenes
  const hasNotAllSentOrders = quotationRequest.quotationSuppliers.some(
    qs => qs.status !== QuotationSupplierStatus.SENT
  );
  if (hasNotAllSentOrders) {
    return QuotationStep.GENERATE_ORDERS;
  }

  // Si tiene órdenes enviadas pero ninguno ha enviado cotizaciones
  const hasSupplierQuotations = quotationRequest.quotationSuppliers.some(
    qs => qs.supplierQuotation
  );
  if (!hasSupplierQuotations) {
    return QuotationStep.RECEIVE_QUOTATIONS;
  }

  // Si tiene cotizaciones pero ninguna está enviada
  const hasSubmittedQuotations = quotationRequest.quotationSuppliers.some(
    qs => qs.supplierQuotation?.status === 'SUBMITTED'
  );
  if (!hasSubmittedQuotations) {
    return QuotationStep.RECEIVE_QUOTATIONS;
  }

  // Si tiene cotizaciones enviadas pero no hay selección final
  if (quotationRequest.finalSelections.length === 0) {
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
