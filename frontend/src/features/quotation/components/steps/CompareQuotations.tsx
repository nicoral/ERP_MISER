import React, { useState, useMemo, useEffect } from 'react';
import {
  type QuotationComparison,
  type ServiceQuotationComparison,
  type SupplierQuote,
  type ServiceSupplierQuote,
  QuotationItemStatus,
  type SelectedSupplier,
  type QuotationRequest,
} from '../../../../types/quotation';
import { useQuotationService } from '../../../../hooks/useQuotationService';
import { useToast } from '../../../../contexts/ToastContext';
import { Button } from '../../../../components/common/Button';
import type { Requirement } from '../../../../types/requirement';
import { useCurrentExchangeRate } from '../../../../hooks/useGeneralSettings';

interface CompareQuotationsProps {
  requirement: Requirement;
  quotationRequest: QuotationRequest;
  onComplete: (selectedSuppliers: SelectedSupplier[]) => void;
  onBack: () => void;
}

export const CompareQuotations: React.FC<CompareQuotationsProps> = ({
  requirement,
  quotationRequest,
  onComplete,
  onBack,
}) => {
  const { data: exchangeRate } = useCurrentExchangeRate();
  // Extraer selectedSuppliers y quotationRequestId de quotationRequest
  const selectedSuppliers: SelectedSupplier[] =
    quotationRequest.quotationSuppliers
      .filter(qs => qs.supplier)
      .map(qs => ({
        supplier: qs.supplier,
        isSelected: true,
        receivedQuotation: qs.supplierQuotation
          ? {
              id: qs.supplierQuotation.id,
              supplierId: qs.supplier.id,
              requirementId: quotationRequest.requirement.id,
              receivedAt: new Date(qs.supplierQuotation.receivedAt),
              validUntil: new Date(qs.supplierQuotation.validUntil),
              items: qs.supplierQuotation.supplierQuotationItems.map(item => ({
                id: item.id,
                requirementArticleId: item.requirementArticle.id,
                article: item.requirementArticle.article,
                quantity: item.requirementArticle.quantity,
                unitPrice: item.unitPrice || 0,
                totalPrice: item.totalPrice || 0,
                currency: item.currency || 'PEN',
                deliveryTime: item.deliveryTime || 0,
                notes: item.notes || '',
                status: item.status as QuotationItemStatus,
                reasonNotAvailable: item.reasonNotAvailable || '',
              })),
              serviceItems: qs.supplierQuotation.supplierQuotationServiceItems
                .filter(item => item.requirementService)
                .map(item => ({
                  id: item.id,
                  serviceId: item.requirementService!.id,
                  service: item.requirementService!.service,
                  unitPrice: item.unitPrice || 0,
                  currency: item.currency || 'PEN',
                  deliveryTime: item.deliveryTime || 0,
                  duration: item.duration || 0,
                  durationType: item.durationType || 'DIA',
                  notes: item.notes || '',
                  status: item.status,
                  reasonNotAvailable: item.reasonNotAvailable || '',
                })),
              totalAmount: qs.supplierQuotation.totalAmount,
              status:
                qs.supplierQuotation.status === 'SUBMITTED'
                  ? 'SUBMITTED'
                  : 'DRAFT',
              notes: qs.supplierQuotation.notes || '',
            }
          : undefined,
      }));

  const quotationRequestId = quotationRequest.id;

  const { createFinalSelection, loading } = useQuotationService();
  const { showError, showSuccess } = useToast();
  const [selectedProductsBySupplier, setSelectedProductsBySupplier] = useState<
    Record<number, number[]>
  >({});
  const [selectedSuppliersForComparison, setSelectedSuppliersForComparison] =
    useState<Set<number>>(
      new Set(
        selectedSuppliers
          .filter(s => s.receivedQuotation)
          .map(s => s.supplier.id)
      )
    );

  // Nuevo estado para selección de proveedores por producto
  const [productSupplierSelections, setProductSupplierSelections] = useState<
    Record<number, number>
  >({});
  // Nuevo estado para selección de proveedores por servicio
  const [serviceSupplierSelections, setServiceSupplierSelections] = useState<
    Record<number, number>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flags para evitar bucles infinitos en los useEffect
  const [hasInitializedProducts, setHasInitializedProducts] = useState(false);
  const [hasInitializedServices, setHasInitializedServices] = useState(false);

  // Cargar productos seleccionados desde los datos recibidos
  useEffect(() => {
    const loadSelectedProducts = () => {
      const productsBySupplier: Record<number, number[]> = {};

      // Usar los datos de quotationRequest que ya vienen actualizados
      quotationRequest.quotationSuppliers
        .filter(quotationSupplier => quotationSupplier.supplier) // Filtrar proveedores válidos
        .forEach(quotationSupplier => {
          const supplierId = quotationSupplier.supplier.id;
          const selectedArticleIds =
            quotationSupplier.quotationSupplierArticles.map(
              qsa => qsa.requirementArticle.id
            );
          productsBySupplier[supplierId] = selectedArticleIds;
        });

      setSelectedProductsBySupplier(productsBySupplier);
    };

    loadSelectedProducts();
  }, [quotationRequest.id, requirement.id]);

  // Obtener los productos seleccionados para cada proveedor
  const getSelectedProductsForSupplier = (supplierId: number) => {
    const selectedArticleIds = selectedProductsBySupplier[supplierId] || [];
    return requirement.requirementArticles.filter(ra =>
      selectedArticleIds.includes(ra.id)
    );
  };

  // Obtener todos los productos únicos que están siendo cotizados
  const getAllQuotedProducts = () => {
    const allProductIds = new Set<number>();

    selectedSuppliers.forEach(selectedSupplier => {
      if (selectedSupplier.receivedQuotation) {
        const selectedProducts = getSelectedProductsForSupplier(
          selectedSupplier.supplier.id
        );
        selectedProducts.forEach(ra => {
          allProductIds.add(ra.article.id);
        });
      }
    });

    return requirement.requirementArticles.filter(ra =>
      allProductIds.has(ra.article.id)
    );
  };

  // Función para convertir precios a PEN usando el tipo de cambio
  const convertToPEN = (price: number, currency: string): number => {
    if (currency === 'PEN') return price;
    if (currency === 'USD' && exchangeRate?.saleRate) {
      return price * exchangeRate.saleRate;
    }
    return price; // Fallback si no hay tipo de cambio
  };

  // Función auxiliar para mostrar precio convertido
  const getConvertedPriceDisplay = (
    price: number,
    currency: string
  ): string => {
    if (currency === 'PEN' || !exchangeRate?.saleRate) return '';
    const convertedPrice = convertToPEN(price, currency);
    return `(PEN ${convertedPrice.toFixed(2)})`;
  };

  // Generar comparación de cotizaciones
  const comparisonData = useMemo(() => {
    const comparisons: QuotationComparison[] = [];
    const quotedProducts = getAllQuotedProducts();

    quotedProducts.forEach(requirementArticle => {
      const supplierQuotes: SupplierQuote[] = [];

      selectedSuppliers.forEach(selectedSupplier => {
        const quotation = selectedSupplier.receivedQuotation;
        if (
          quotation &&
          selectedSuppliersForComparison.has(selectedSupplier.supplier.id)
        ) {
          // Verificar si este producto fue seleccionado para este proveedor
          const selectedProducts = getSelectedProductsForSupplier(
            selectedSupplier.supplier.id
          );
          const isProductSelected = selectedProducts.some(
            ra => ra.article.id === requirementArticle.article.id
          );

          if (isProductSelected) {
            const item = quotation.items.find(
              i => i.article.id === requirementArticle.article.id
            );
            if (item) {
              supplierQuotes.push({
                supplierId: selectedSupplier.supplier.id,
                supplier: selectedSupplier.supplier,
                unitPrice: item.unitPrice || 0,
                totalPrice: item.totalPrice || 0,
                currency: item.currency || 'PEN',
                deliveryTime: item.deliveryTime || 0,
                isBestPrice: false,
                status: item.status,
                reasonNotAvailable: item.reasonNotAvailable || '',
              });
            }
          }
        }
      });

      // Determinar el mejor precio (solo entre productos cotizados)
      const quotedItems = supplierQuotes.filter(
        q => q.status === QuotationItemStatus.QUOTED
      );
      if (quotedItems.length > 0) {
        const bestPrice = quotedItems.reduce((min, quote) => {
          const minPriceInPEN = convertToPEN(
            Number(min.unitPrice) || 0,
            min.currency
          );
          const currentPriceInPEN = convertToPEN(
            Number(quote.unitPrice) || 0,
            quote.currency
          );
          return currentPriceInPEN < minPriceInPEN ? quote : min;
        });
        supplierQuotes.forEach(quote => {
          quote.isBestPrice = quote.supplierId === bestPrice.supplierId;
        });
      }

      comparisons.push({
        articleId: requirementArticle.article.id,
        article: requirementArticle.article,
        quantity: requirementArticle.quantity,
        supplierQuotes,
        bestPrice: supplierQuotes.find(q => q.isBestPrice),
      });
    });

    return comparisons;
  }, [
    requirement,
    selectedSuppliers,
    selectedSuppliersForComparison,
    selectedProductsBySupplier,
  ]);

  // Generar selecciones automáticas basadas en mejores precios
  const autoSelections = useMemo(() => {
    const selections: Record<number, number> = {};

    comparisonData.forEach(comparison => {
      if (comparison.bestPrice) {
        selections[comparison.articleId] = comparison.bestPrice.supplierId;
      }
    });

    return selections;
  }, [comparisonData]);

  // Aplicar selecciones automáticas solo una vez al cargar
  useEffect(() => {
    if (!hasInitializedProducts && Object.keys(autoSelections).length > 0) {
      setProductSupplierSelections(autoSelections);
      setHasInitializedProducts(true);
    }
  }, [autoSelections, hasInitializedProducts]);

  const handleProductSupplierSelection = (
    articleId: number,
    supplierId: number
  ) => {
    setProductSupplierSelections(prev => ({
      ...prev,
      [articleId]: supplierId,
    }));
  };

  const handleSupplierToggle = (supplierId: number) => {
    const newSelected = new Set(selectedSuppliersForComparison);
    if (newSelected.has(supplierId)) {
      newSelected.delete(supplierId);
    } else {
      newSelected.add(supplierId);
    }
    setSelectedSuppliersForComparison(newSelected);
  };

  // Obtener todos los servicios únicos que están siendo cotizados
  const getAllQuotedServices = () => {
    const allServiceIds = new Set<number>();

    selectedSuppliers.forEach(selectedSupplier => {
      if (selectedSupplier.receivedQuotation) {
        // Usar los servicios de las cotizaciones recibidas
        selectedSupplier.receivedQuotation.serviceItems?.forEach(item => {
          allServiceIds.add(item.service.id);
        });
      }
    });

    return (
      requirement.requirementServices?.filter(rs =>
        allServiceIds.has(rs.service.id)
      ) || []
    );
  };

  // Generar comparación de servicios
  const serviceComparisonData = useMemo(() => {
    const comparisons: ServiceQuotationComparison[] = [];
    const quotedServices = getAllQuotedServices();

    quotedServices.forEach(requirementService => {
      const supplierQuotes: ServiceSupplierQuote[] = [];

      selectedSuppliers.forEach(selectedSupplier => {
        if (
          selectedSupplier.receivedQuotation &&
          selectedSuppliersForComparison.has(selectedSupplier.supplier.id)
        ) {
          // Buscar el servicio en las cotizaciones de servicios reales
          const serviceItem =
            selectedSupplier.receivedQuotation.serviceItems?.find(
              item => item.service.id === requirementService.service.id
            );

          if (serviceItem) {
            const serviceQuote: ServiceSupplierQuote = {
              supplierId: selectedSupplier.supplier.id,
              supplier: selectedSupplier.supplier,
              unitPrice: serviceItem.unitPrice || 0,
              totalPrice: serviceItem.unitPrice || 0, // Para servicios, el total es igual al unitPrice
              currency: serviceItem.currency || 'PEN',
              deliveryTime: serviceItem.deliveryTime || 0,
              duration: serviceItem.duration || 0,
              durationType: serviceItem.durationType || 'DIA',
              isBestPrice: false,
              status: serviceItem.status,
              reasonNotAvailable: serviceItem.reasonNotAvailable || '',
            };
            supplierQuotes.push(serviceQuote);
          }
        }
      });

      // Determinar el mejor precio (solo entre servicios cotizados)
      const quotedItems = supplierQuotes.filter(
        q => q.status === QuotationItemStatus.QUOTED
      );
      if (quotedItems.length > 0) {
        const bestPrice = quotedItems.reduce((min, quote) => {
          const minPriceInPEN = convertToPEN(
            Number(min.unitPrice) || 0,
            min.currency
          );
          const currentPriceInPEN = convertToPEN(
            Number(quote.unitPrice) || 0,
            quote.currency
          );
          return currentPriceInPEN < minPriceInPEN ? quote : min;
        });
        supplierQuotes.forEach(quote => {
          quote.isBestPrice = quote.supplierId === bestPrice.supplierId;
        });
      }

      comparisons.push({
        serviceId: requirementService.service.id,
        service: requirementService.service,
        supplierQuotes,
        bestPrice: supplierQuotes.find(q => q.isBestPrice),
      });
    });

    return comparisons;
  }, [requirement, selectedSuppliers, selectedSuppliersForComparison]);

  // Generar selecciones automáticas para servicios basadas en mejores precios
  const autoServiceSelections = useMemo(() => {
    const selections: Record<number, number> = {};

    serviceComparisonData.forEach(comparison => {
      if (comparison.bestPrice) {
        selections[comparison.serviceId] = comparison.bestPrice.supplierId;
      }
    });

    return selections;
  }, [serviceComparisonData]);

  // Aplicar selecciones automáticas para servicios solo una vez al cargar
  useEffect(() => {
    if (
      !hasInitializedServices &&
      Object.keys(autoServiceSelections).length > 0
    ) {
      setServiceSupplierSelections(autoServiceSelections);
      setHasInitializedServices(true);
    }
  }, [autoServiceSelections, hasInitializedServices]);

  const handleServiceSupplierSelection = (
    serviceId: number,
    supplierId: number
  ) => {
    setServiceSupplierSelections(prev => ({
      ...prev,
      [serviceId]: supplierId,
    }));
  };

  const handleContinue = async () => {
    // Filtrar solo los proveedores seleccionados para la comparación
    const filteredSuppliers = selectedSuppliers.filter(supplier =>
      selectedSuppliersForComparison.has(supplier.supplier.id)
    );

    // Validar que haya al menos un proveedor seleccionado
    if (filteredSuppliers.length === 0) {
      showError(
        'Error',
        'Debes seleccionar al menos un proveedor para continuar'
      );
      return;
    }

    // Validar que todos los productos tengan un proveedor seleccionado
    const unselectedProducts = comparisonData.filter(
      comp => !productSupplierSelections[comp.articleId]
    );

    if (unselectedProducts.length > 0) {
      showError(
        'Productos sin seleccionar',
        `Debes seleccionar un proveedor para: ${unselectedProducts
          .map(comp => comp.article.name)
          .join(', ')}`
      );
      return;
    }

    // Validar que todos los servicios tengan un proveedor seleccionado
    const unselectedServices = serviceComparisonData.filter(
      comp => !serviceSupplierSelections[comp.serviceId]
    );

    if (unselectedServices.length > 0) {
      showError(
        'Servicios sin seleccionar',
        `Debes seleccionar un proveedor para: ${unselectedServices
          .map(comp => comp.service.name)
          .join(', ')}`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear los items de la selección final para artículos
      const finalSelectionItems: Array<{
        articleId: number;
        supplierId: number;
        selectedPrice: number;
        notes?: string;
      }> = comparisonData.map(comparison => {
        const selectedSupplierId =
          productSupplierSelections[comparison.articleId];
        const selectedSupplier = selectedSuppliers.find(
          s => s.supplier.id === selectedSupplierId
        );
        const quotation = selectedSupplier?.receivedQuotation;
        const item = quotation?.items.find(
          i => i.article.id === comparison.articleId
        );

        // Encontrar el requirementArticle correspondiente
        const requirementArticle = requirement.requirementArticles.find(
          ra => ra.article.id === comparison.articleId
        );

        return {
          articleId: requirementArticle?.id || 0,
          supplierId: selectedSupplierId,
          selectedPrice: item?.unitPrice || 0,
          notes: item?.notes || '',
        };
      });

      // Crear los items de la selección final para servicios
      const finalSelectionServiceItems = serviceComparisonData.map(
        comparison => {
          const selectedSupplierId =
            serviceSupplierSelections[comparison.serviceId];
          const selectedSupplier = selectedSuppliers.find(
            s => s.supplier.id === selectedSupplierId
          );
          const quotation = selectedSupplier?.receivedQuotation;
          const serviceItem = quotation?.serviceItems?.find(
            item => item.service.id === comparison.serviceId
          );

          // Encontrar el requirementService correspondiente
          const requirementService = requirement.requirementServices?.find(
            rs => rs.service.id === comparison.serviceId
          );

          return {
            requirementServiceId: requirementService?.id || 0,
            supplierId: selectedSupplierId,
            unitPrice: serviceItem?.unitPrice || 0,
            notes: serviceItem?.notes || '',
            currency: serviceItem?.currency || 'PEN',
            deliveryTime: serviceItem?.deliveryTime || 0,
            durationType: serviceItem?.durationType || 'DIA',
            duration: serviceItem?.duration || 0,
          };
        }
      );

      const finalSelectionData = {
        quotationRequestId: String(quotationRequestId),
        items: finalSelectionItems,
        serviceItems: finalSelectionServiceItems,
      };

      const createdFinalSelection =
        await createFinalSelection(finalSelectionData);

      if (createdFinalSelection) {
        // Actualizar proveedores seleccionados
        const updatedSuppliers = selectedSuppliers.map(supplier => ({
          ...supplier,
          isFinalSelected:
            finalSelectionItems.some(
              item => item.supplierId === supplier.supplier.id
            ) ||
            finalSelectionServiceItems.some(
              item => item.supplierId === supplier.supplier.id
            ),
        }));

        const message = `Selección final completada con ${filteredSuppliers.length} proveedores`;
        showSuccess('Selección final guardada', message);

        // Pasar solo los proveedores seleccionados al siguiente paso
        onComplete(updatedSuppliers);
      } else {
        showError('Error al guardar', 'No se pudo guardar la selección final');
      }
    } catch {
      showError(
        'Error al guardar',
        'Ocurrió un error al guardar la selección final'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalBySupplier = (supplierId: number) => {
    // Total de productos
    const productsTotal = comparisonData.reduce((total, comparison) => {
      const quote = comparison.supplierQuotes.find(
        q => q.supplierId === supplierId
      );
      if (quote && quote.status === QuotationItemStatus.QUOTED) {
        const totalPriceInPEN = convertToPEN(
          Number(quote.totalPrice) || 0,
          quote.currency
        );
        return total + totalPriceInPEN;
      }
      return total;
    }, 0);

    // Total de servicios
    const servicesTotal = serviceComparisonData.reduce((total, comparison) => {
      const quote = comparison.supplierQuotes.find(
        q => q.supplierId === supplierId
      );
      if (quote && quote.status === QuotationItemStatus.QUOTED) {
        const totalPriceInPEN = convertToPEN(
          Number(quote.totalPrice) || 0,
          quote.currency
        );
        return total + totalPriceInPEN;
      }
      return total;
    }, 0);

    return productsTotal + servicesTotal;
  };

  // Función para calcular el total general de todos los productos y servicios seleccionados
  const getTotalGeneral = () => {
    // Total de productos seleccionados
    const productsTotal = comparisonData.reduce((total, comparison) => {
      // Obtener el proveedor seleccionado para este producto
      const selectedSupplierId =
        productSupplierSelections[comparison.articleId];
      if (!selectedSupplierId) return total;

      // Obtener la cotización del proveedor seleccionado
      const quote = comparison.supplierQuotes.find(
        q => q.supplierId === selectedSupplierId
      );

      if (quote && quote.status === QuotationItemStatus.QUOTED) {
        const totalPriceInPEN = convertToPEN(
          Number(quote.totalPrice) || 0,
          quote.currency
        );
        return total + totalPriceInPEN;
      }
      return total;
    }, 0);

    // Total de servicios seleccionados
    const servicesTotal = serviceComparisonData.reduce((total, comparison) => {
      // Obtener el proveedor seleccionado para este servicio
      const selectedSupplierId =
        serviceSupplierSelections[comparison.serviceId];
      if (!selectedSupplierId) return total;

      // Obtener la cotización del proveedor seleccionado
      const quote = comparison.supplierQuotes.find(
        q => q.supplierId === selectedSupplierId
      );

      if (quote && quote.status === QuotationItemStatus.QUOTED) {
        const totalPriceInPEN = convertToPEN(
          Number(quote.totalPrice) || 0,
          quote.currency
        );
        return total + totalPriceInPEN;
      }
      return total;
    }, 0);

    return productsTotal + servicesTotal;
  };

  const getBestTotalSupplier = () => {
    const supplierTotals = Array.from(selectedSuppliersForComparison).map(
      supplierId => {
        // Obtener todos los productos del proveedor
        const supplierProductQuotes = comparisonData.flatMap(comp =>
          comp.supplierQuotes.filter(q => q.supplierId === supplierId)
        );

        // Obtener todos los servicios del proveedor
        const supplierServiceQuotes = serviceComparisonData.flatMap(comp =>
          comp.supplierQuotes.filter(q => q.supplierId === supplierId)
        );

        // Combinar productos y servicios
        const allQuotes = [...supplierProductQuotes, ...supplierServiceQuotes];

        // Contar items por estado
        const quotedCount = allQuotes.filter(
          q => q.status === QuotationItemStatus.QUOTED
        ).length;
        const notAvailableCount = allQuotes.filter(
          q => q.status === QuotationItemStatus.NOT_AVAILABLE
        ).length;
        const notQuotedCount = allQuotes.filter(
          q => q.status === QuotationItemStatus.NOT_QUOTED
        ).length;
        const totalItemsCount = allQuotes.length;

        // Calcular el total de productos y servicios cotizados
        const total = getTotalBySupplier(supplierId);

        // Calcular puntuación basada en múltiples criterios
        let score = 0;

        // 1. Preferencia por proveedores con todos los items cotizados (máxima prioridad)
        if (quotedCount === totalItemsCount && totalItemsCount > 0) {
          score += 1000000; // Puntuación muy alta para proveedores completos
        }

        // 2. Preferencia por proveedores con menos items no disponibles
        const notAvailablePenalty = notAvailableCount * 100000; // Penalización alta por items no disponibles
        score -= notAvailablePenalty;

        // 3. Preferencia por proveedores con menos items no cotizados
        const notQuotedPenalty = notQuotedCount * 50000; // Penalización media por items no cotizados
        score -= notQuotedPenalty;

        // 4. Preferencia por menor precio total (entre proveedores con misma cobertura)
        score += 1000000 - total; // Invertir el total para que menor precio = mayor puntuación

        // 5. Bonus por porcentaje de items cotizados
        const quotedPercentage =
          totalItemsCount > 0 ? (quotedCount / totalItemsCount) * 100 : 0;
        score += quotedPercentage * 1000;

        return {
          supplierId,
          total,
          score,
          quotedCount,
          notAvailableCount,
          notQuotedCount,
          totalItemsCount,
          quotedPercentage,
        };
      }
    );

    if (supplierTotals.length === 0) return null;

    // Ordenar por puntuación (mayor puntuación = mejor proveedor)
    const sortedSuppliers = supplierTotals.sort((a, b) => b.score - a.score);

    // Retornar el proveedor con mejor puntuación
    return sortedSuppliers[0];
  };

  // Función auxiliar para obtener información del mejor proveedor
  const getBestSupplierInfo = () => {
    const bestSupplier = getBestTotalSupplier();
    if (!bestSupplier) return null;

    const supplier = selectedSuppliers.find(
      s => s.supplier.id === bestSupplier.supplierId
    )?.supplier;

    return {
      ...bestSupplier,
      supplier,
    };
  };

  const availableSuppliers = selectedSuppliers.filter(s => s.receivedQuotation);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Selección Final de Proveedores
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Compara precios y selecciona el proveedor final para cada producto
          cotizado
        </p>
      </div>

      {/* Supplier Selection */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
          Seleccionar proveedores para comparar
        </h4>
        <div className="flex flex-wrap gap-3">
          {availableSuppliers.map(selectedSupplier => {
            const supplier = selectedSupplier.supplier;
            const isSelected = selectedSuppliersForComparison.has(supplier.id);
            const selectedProductsCount = getSelectedProductsForSupplier(
              supplier.id
            ).length;

            return (
              <label
                key={supplier.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSupplierToggle(supplier.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span
                  className={`text-sm font-medium ${
                    isSelected
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {supplier.businessName}
                  <span className="text-xs text-gray-400 ml-1">
                    ({selectedProductsCount} productos)
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Articles Comparison Table */}
      {selectedSuppliersForComparison.size > 0 && comparisonData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Artículos
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cantidad
                  </th>
                  {Array.from(selectedSuppliersForComparison).map(
                    supplierId => {
                      const supplier = selectedSuppliers.find(
                        s => s.supplier.id === supplierId
                      )?.supplier;
                      return (
                        <th
                          key={supplierId}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {supplier?.businessName}
                        </th>
                      );
                    }
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Proveedor Seleccionado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {comparisonData.map(comparison => (
                  <tr key={comparison.articleId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {comparison.article.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {comparison.article.code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                      {comparison.quantity}
                    </td>
                    {Array.from(selectedSuppliersForComparison).map(
                      supplierId => {
                        const quote = comparison.supplierQuotes.find(
                          q => q.supplierId === supplierId
                        );
                        const isBestPrice = quote?.isBestPrice;
                        const selectedProducts =
                          getSelectedProductsForSupplier(supplierId);
                        const isProductSelected = selectedProducts.some(
                          ra => ra.article.id === comparison.articleId
                        );
                        const isSelectedSupplier =
                          productSupplierSelections[comparison.articleId] ===
                          supplierId;

                        return (
                          <td
                            key={supplierId}
                            className={`px-6 py-4 whitespace-nowrap ${
                              isSelectedSupplier
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : ''
                            }`}
                          >
                            {!isProductSelected ? (
                              <span className="text-sm text-gray-400 dark:text-gray-500">
                                No solicitado
                              </span>
                            ) : quote ? (
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`text-sm font-medium ${
                                      isSelectedSupplier
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-900 dark:text-white'
                                    }`}
                                  >
                                    {quote.currency}{' '}
                                    {(Number(quote.unitPrice) || 0).toFixed(2)}
                                  </span>
                                  {isBestPrice && (
                                    <span className="text-green-500">🏆</span>
                                  )}
                                  {isSelectedSupplier && !isBestPrice && (
                                    <span className="text-green-500">✓</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Total: {quote.currency}{' '}
                                  {(Number(quote.totalPrice) || 0).toFixed(2)}
                                  {quote.currency !== 'PEN' && (
                                    <span className="text-blue-500 ml-1">
                                      {getConvertedPriceDisplay(
                                        Number(quote.totalPrice) || 0,
                                        quote.currency
                                      )}
                                    </span>
                                  )}
                                </div>
                                {quote.deliveryTime && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Entrega: {quote.deliveryTime} días
                                  </div>
                                )}
                                {quote.status ===
                                  QuotationItemStatus.NOT_AVAILABLE && (
                                  <div className="text-xs text-red-500 dark:text-red-400">
                                    No disponible:
                                    {quote.reasonNotAvailable}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">
                                No cotizado
                              </span>
                            )}
                          </td>
                        );
                      }
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={
                          productSupplierSelections[comparison.articleId] || ''
                        }
                        onChange={e =>
                          handleProductSupplierSelection(
                            comparison.articleId,
                            Number(e.target.value)
                          )
                        }
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Seleccionar proveedor</option>
                        {comparison.supplierQuotes
                          .filter(
                            quote => quote.status === QuotationItemStatus.QUOTED
                          )
                          .map(quote => (
                            <option
                              key={quote.supplierId}
                              value={quote.supplierId}
                            >
                              {quote.supplier.businessName} - {quote.currency}{' '}
                              {(Number(quote.unitPrice) || 0).toFixed(2)}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals Row */}
              <tfoot className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    TOTAL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                    {comparisonData.reduce(
                      (sum, comp) => sum + Number(comp.quantity),
                      0
                    )}
                  </td>
                  {Array.from(selectedSuppliersForComparison).map(
                    supplierId => {
                      const total = getTotalBySupplier(supplierId);
                      const bestTotal = getBestTotalSupplier();
                      const isBestTotal =
                        bestTotal && bestTotal.supplierId === supplierId;

                      return (
                        <td
                          key={supplierId}
                          className={`px-6 py-4 whitespace-nowrap ${
                            isBestTotal
                              ? 'bg-green-50 dark:bg-green-900/20'
                              : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-sm font-bold ${
                                isBestTotal
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              PEN {(Number(total) || 0).toFixed(2)}
                            </span>
                            {isBestTotal && (
                              <span className="text-green-500">🏆</span>
                            )}
                          </div>
                        </td>
                      );
                    }
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                    PEN {getTotalGeneral().toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Services Comparison Table */}
      {selectedSuppliersForComparison.size > 0 &&
        serviceComparisonData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Servicios
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Duración
                    </th>
                    {Array.from(selectedSuppliersForComparison).map(
                      supplierId => {
                        const supplier = selectedSuppliers.find(
                          s => s.supplier.id === supplierId
                        )?.supplier;
                        return (
                          <th
                            key={supplierId}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            {supplier?.businessName}
                          </th>
                        );
                      }
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Proveedor Seleccionado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {serviceComparisonData.map(comparison => (
                    <tr key={comparison.serviceId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {comparison.service.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {comparison.service.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                        {comparison.supplierQuotes[0]?.duration || 0}{' '}
                        {comparison.supplierQuotes[0]?.durationType || ''}
                      </td>
                      {Array.from(selectedSuppliersForComparison).map(
                        supplierId => {
                          const quote = comparison.supplierQuotes.find(
                            q => q.supplierId === supplierId
                          );
                          const isBestPrice = quote?.isBestPrice;
                          const isSelectedSupplier =
                            serviceSupplierSelections[comparison.serviceId] ===
                            supplierId;

                          return (
                            <td
                              key={supplierId}
                              className={`px-6 py-4 whitespace-nowrap ${
                                isSelectedSupplier
                                  ? 'bg-green-50 dark:bg-green-900/20'
                                  : ''
                              }`}
                            >
                              {quote ? (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`text-sm font-medium ${
                                        isSelectedSupplier
                                          ? 'text-green-600 dark:text-green-400'
                                          : 'text-gray-900 dark:text-white'
                                      }`}
                                    >
                                      {quote.currency}{' '}
                                      {(Number(quote.unitPrice) || 0).toFixed(
                                        2
                                      )}
                                    </span>
                                    {isBestPrice && (
                                      <span className="text-green-500">🏆</span>
                                    )}
                                    {isSelectedSupplier && !isBestPrice && (
                                      <span className="text-green-500">✓</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Total: {quote.currency}{' '}
                                    {(Number(quote.totalPrice) || 0).toFixed(2)}
                                    {quote.currency !== 'PEN' && (
                                      <span className="text-blue-500 ml-1">
                                        {getConvertedPriceDisplay(
                                          Number(quote.totalPrice) || 0,
                                          quote.currency
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  {quote.duration && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Duración: {quote.duration}{' '}
                                      {quote.durationType}
                                    </div>
                                  )}
                                  {quote.deliveryTime && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Entrega: {quote.deliveryTime} días
                                    </div>
                                  )}
                                  {quote.status ===
                                    QuotationItemStatus.NOT_AVAILABLE && (
                                    <div className="text-xs text-red-500 dark:text-red-400">
                                      No disponible:
                                      {quote.reasonNotAvailable}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400 dark:text-gray-500">
                                  No cotizado
                                </span>
                              )}
                            </td>
                          );
                        }
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={
                            serviceSupplierSelections[comparison.serviceId] ||
                            ''
                          }
                          onChange={e =>
                            handleServiceSupplierSelection(
                              comparison.serviceId,
                              Number(e.target.value)
                            )
                          }
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Seleccionar proveedor</option>
                          {comparison.supplierQuotes
                            .filter(
                              quote =>
                                quote.status === QuotationItemStatus.QUOTED
                            )
                            .map(quote => (
                              <option
                                key={quote.supplierId}
                                value={quote.supplierId}
                              >
                                {quote.supplier.businessName} - {quote.currency}{' '}
                                {(Number(quote.unitPrice) || 0).toFixed(2)}
                              </option>
                            ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Totals Row for Services */}
                <tfoot className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      TOTAL SERVICIOS
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                      {serviceComparisonData.length} servicios
                    </td>
                    {Array.from(selectedSuppliersForComparison).map(
                      supplierId => {
                        // Calcular total de servicios para este proveedor
                        const servicesTotal = serviceComparisonData.reduce(
                          (total, comparison) => {
                            const quote = comparison.supplierQuotes.find(
                              q => q.supplierId === supplierId
                            );
                            if (
                              quote &&
                              quote.status === QuotationItemStatus.QUOTED
                            ) {
                              const totalPriceInPEN = convertToPEN(
                                Number(quote.totalPrice) || 0,
                                quote.currency
                              );
                              return total + totalPriceInPEN;
                            }
                            return total;
                          },
                          0
                        );

                        const bestTotal = getBestTotalSupplier();
                        const isBestTotal =
                          bestTotal && bestTotal.supplierId === supplierId;

                        return (
                          <td
                            key={supplierId}
                            className={`px-6 py-4 whitespace-nowrap ${
                              isBestTotal
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : ''
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-sm font-bold ${
                                  isBestTotal
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-900 dark:text-white'
                                }`}
                              >
                                PEN {(Number(servicesTotal) || 0).toFixed(2)}
                              </span>
                              {isBestTotal && (
                                <span className="text-green-500">🏆</span>
                              )}
                            </div>
                          </td>
                        );
                      }
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                      PEN{' '}
                      {(() => {
                        // Calcular total general de servicios seleccionados
                        return serviceComparisonData.reduce(
                          (total, comparison) => {
                            const selectedSupplierId =
                              serviceSupplierSelections[comparison.serviceId];
                            if (!selectedSupplierId) return total;

                            const quote = comparison.supplierQuotes.find(
                              q => q.supplierId === selectedSupplierId
                            );

                            if (
                              quote &&
                              quote.status === QuotationItemStatus.QUOTED
                            ) {
                              const totalPriceInPEN = convertToPEN(
                                Number(quote.totalPrice) || 0,
                                quote.currency
                              );
                              return total + totalPriceInPEN;
                            }
                            return total;
                          },
                          0
                        );
                      })().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

      {/* Analysis Section */}
      {selectedSuppliersForComparison.size > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Best Price Analysis */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Análisis de Mejores Precios
            </h4>
            <div className="space-y-3">
              {/* Productos */}
              {comparisonData.map(comparison => {
                const bestQuote = comparison.bestPrice;
                if (!bestQuote) return null;

                return (
                  <div
                    key={comparison.articleId}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {comparison.article.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {comparison.article.code}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                      <span className="font-medium text-green-600 dark:text-green-400 text-sm">
                        {bestQuote.currency} {(Number(bestQuote.unitPrice) || 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {bestQuote.supplier.businessName}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Servicios */}
              {serviceComparisonData.map(comparison => {
                const bestQuote = comparison.bestPrice;
                if (!bestQuote) return null;

                return (
                  <div
                    key={comparison.serviceId}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {comparison.service.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {comparison.service.code}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                      <span className="font-medium text-green-600 dark:text-green-400 text-sm">
                        {bestQuote.currency} {(Number(bestQuote.unitPrice) || 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {bestQuote.supplier.businessName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplier Summary */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Resumen por Proveedor
            </h4>

            {/* Best Supplier Info */}
            {(() => {
              const bestSupplierInfo = getBestSupplierInfo();
              if (bestSupplierInfo) {
                return (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-green-500">🏆</span>
                      <span className="font-medium text-green-700 dark:text-green-300">
                        Mejor Proveedor Seleccionado
                      </span>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      <div className="font-medium">
                        {bestSupplierInfo.supplier?.businessName}
                      </div>
                      <div className="text-xs mt-1 flex flex-wrap gap-1">
                        <span>
                          {bestSupplierInfo.quotedCount} de{' '}
                          {bestSupplierInfo.totalItemsCount} items cotizados (
                          {bestSupplierInfo.quotedPercentage.toFixed(0)}%
                          cobertura)
                        </span>
                        {bestSupplierInfo.notAvailableCount > 0 && (
                          <span className="text-red-500">
                            • {bestSupplierInfo.notAvailableCount} no
                            disponibles
                          </span>
                        )}
                        {bestSupplierInfo.notQuotedCount > 0 && (
                          <span className="text-gray-500">
                            • {bestSupplierInfo.notQuotedCount} no cotizados
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-3">
              {Array.from(selectedSuppliersForComparison).map(supplierId => {
                const supplier = selectedSuppliers.find(
                  s => s.supplier.id === supplierId
                )?.supplier;
                const total = getTotalBySupplier(supplierId);
                const bestTotal = getBestTotalSupplier();
                const isBestTotal =
                  bestTotal && bestTotal.supplierId === supplierId;

                // Contar productos por estado
                const supplierProductQuotes = comparisonData.flatMap(comp =>
                  comp.supplierQuotes.filter(q => q.supplierId === supplierId)
                );

                // Contar servicios por estado
                const supplierServiceQuotes = serviceComparisonData.flatMap(
                  comp =>
                    comp.supplierQuotes.filter(q => q.supplierId === supplierId)
                );

                // Combinar productos y servicios
                const allQuotes = [
                  ...supplierProductQuotes,
                  ...supplierServiceQuotes,
                ];

                const quotedCount = allQuotes.filter(
                  q => q.status === QuotationItemStatus.QUOTED
                ).length;
                const notAvailableCount = allQuotes.filter(
                  q => q.status === QuotationItemStatus.NOT_AVAILABLE
                ).length;
                const notQuotedCount = allQuotes.filter(
                  q => q.status === QuotationItemStatus.NOT_QUOTED
                ).length;
                const totalItemsCount = allQuotes.length;

                const bestPricesCount =
                  comparisonData.filter(
                    comp =>
                      comp.supplierQuotes.find(q => q.supplierId === supplierId)
                        ?.isBestPrice
                  ).length +
                  serviceComparisonData.filter(
                    comp =>
                      comp.supplierQuotes.find(q => q.supplierId === supplierId)
                        ?.isBestPrice
                  ).length;

                return (
                  <div
                    key={supplierId}
                    className={`p-3 rounded-lg border ${
                      isBestTotal
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {supplier?.businessName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <div className="flex flex-wrap gap-2 sm:gap-4">
                            <span className="flex-shrink-0">
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {quotedCount}
                              </span>{' '}
                              cotizados
                            </span>
                            <span className="flex-shrink-0">
                              <span className="font-medium text-red-600 dark:text-red-400">
                                {notAvailableCount}
                              </span>{' '}
                              no disponibles
                            </span>
                            <span className="flex-shrink-0">
                              <span className="font-medium text-gray-600 dark:text-gray-400">
                                {notQuotedCount}
                              </span>{' '}
                              no cotizados
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {bestPricesCount} mejores precios de{' '}
                            {totalItemsCount} items totales
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right sm:ml-4 flex-shrink-0">
                        <div
                          className={`font-bold ${
                            isBestTotal
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          PEN {(Number(total) || 0).toFixed(2)}
                        </div>
                        {isBestTotal && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Mejor total
                          </div>
                        )}
                        {quotedCount > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Solo items cotizados
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button 
          onClick={onBack}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          ← Volver
        </Button>
        <Button
          onClick={handleContinue}
          disabled={
            selectedSuppliersForComparison.size === 0 ||
            (Object.keys(productSupplierSelections).length === 0 &&
              Object.keys(serviceSupplierSelections).length === 0) ||
            isSubmitting ||
            loading
          }
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isSubmitting || loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            'Completar Selección Final'
          )}
        </Button>
      </div>
    </div>
  );
};
