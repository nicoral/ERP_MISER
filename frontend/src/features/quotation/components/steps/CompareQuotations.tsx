import React, { useState, useMemo, useEffect } from 'react';
import {
  type QuotationComparison,
  type SupplierQuote,
  QuotationItemStatus,
  type SelectedSupplier,
} from '../../../../types/quotation';
import { useQuotationService } from '../../../../hooks/useQuotationService';
import { useToast } from '../../../../contexts/ToastContext';
import { Button } from '../../../../components/common/Button';
import type { Requirement } from '../../../../types/requirement';

interface CompareQuotationsProps {
  requirement: Requirement;
  selectedSuppliers: SelectedSupplier[];
  quotationRequestId: number;
  onComplete: (selectedSuppliers: SelectedSupplier[]) => void;
  onBack: () => void;
}

export const CompareQuotations: React.FC<CompareQuotationsProps> = ({
  requirement,
  selectedSuppliers,
  quotationRequestId,
  onComplete,
  onBack,
}) => {
  const { getQuotationByRequirement, createFinalSelection } =
    useQuotationService();
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

  // Cargar productos seleccionados desde el backend
  useEffect(() => {
    const loadSelectedProducts = async () => {
      try {
        const existingQuotation = await getQuotationByRequirement(
          requirement.id
        );
        if (existingQuotation) {
          const productsBySupplier: Record<number, number[]> = {};

          existingQuotation.quotationSuppliers
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
        }
      } catch {
        // Si no hay cotización existente, usar todos los productos como fallback
        const fallbackProducts: Record<number, number[]> = {};
        selectedSuppliers
          .filter(supplier => supplier.supplier) // Filtrar proveedores válidos
          .forEach(supplier => {
            fallbackProducts[supplier.supplier.id] =
              requirement.requirementArticles.map(ra => ra.id);
          });
        setSelectedProductsBySupplier(fallbackProducts);
      }
    };

    loadSelectedProducts();
  }, [requirement.id, selectedSuppliers, getQuotationByRequirement]);

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
          const minPrice = Number(min.unitPrice) || 0;
          const currentPrice = Number(quote.unitPrice) || 0;
          return currentPrice < minPrice ? quote : min;
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

  // Aplicar selecciones automáticas al cargar
  useEffect(() => {
    setProductSupplierSelections(autoSelections);
  }, [autoSelections]);

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

    try {
      // Crear los items de la selección final
      const finalSelectionItems = comparisonData.map(comparison => {
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
          articleId: requirementArticle?.id.toString() || '',
          supplierId: selectedSupplierId.toString(),
          selectedPrice: item?.unitPrice || 0,
          notes: item?.notes || '',
        };
      });

      const finalSelectionData = {
        quotationRequestId: String(quotationRequestId),
        items: finalSelectionItems,
      };

      const createdFinalSelection =
        await createFinalSelection(finalSelectionData);

      if (createdFinalSelection) {
        // Actualizar proveedores seleccionados
        const updatedSuppliers = selectedSuppliers.map(supplier => ({
          ...supplier,
          isFinalSelected: finalSelectionItems.some(
            item => Number(item.supplierId) === supplier.supplier.id
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
    }
  };

  const getTotalBySupplier = (supplierId: number) => {
    return comparisonData.reduce((total, comparison) => {
      const quote = comparison.supplierQuotes.find(
        q => q.supplierId === supplierId
      );
      if (quote && quote.status === QuotationItemStatus.QUOTED) {
        return total + (Number(quote.totalPrice) || 0);
      }
      return total;
    }, 0);
  };

  const getBestTotalSupplier = () => {
    const supplierTotals = Array.from(selectedSuppliersForComparison).map(
      supplierId => {
        // Obtener todos los productos del proveedor
        const supplierQuotes = comparisonData.flatMap(comp =>
          comp.supplierQuotes.filter(q => q.supplierId === supplierId)
        );

        // Contar productos por estado
        const quotedCount = supplierQuotes.filter(
          q => q.status === QuotationItemStatus.QUOTED
        ).length;
        const notAvailableCount = supplierQuotes.filter(
          q => q.status === QuotationItemStatus.NOT_AVAILABLE
        ).length;
        const notQuotedCount = supplierQuotes.filter(
          q => q.status === QuotationItemStatus.NOT_QUOTED
        ).length;
        const totalProductsCount = supplierQuotes.length;

        // Calcular el total solo de productos cotizados
        const total = getTotalBySupplier(supplierId);

        // Calcular puntuación basada en múltiples criterios
        let score = 0;

        // 1. Preferencia por proveedores con todos los productos cotizados (máxima prioridad)
        if (quotedCount === totalProductsCount && totalProductsCount > 0) {
          score += 1000000; // Puntuación muy alta para proveedores completos
        }

        // 2. Preferencia por proveedores con menos productos no disponibles
        const notAvailablePenalty = notAvailableCount * 100000; // Penalización alta por productos no disponibles
        score -= notAvailablePenalty;

        // 3. Preferencia por proveedores con menos productos no cotizados
        const notQuotedPenalty = notQuotedCount * 50000; // Penalización media por productos no cotizados
        score -= notQuotedPenalty;

        // 4. Preferencia por menor precio total (entre proveedores con misma cobertura)
        score += 1000000 - total; // Invertir el total para que menor precio = mayor puntuación

        // 5. Bonus por porcentaje de productos cotizados
        const quotedPercentage =
          totalProductsCount > 0 ? (quotedCount / totalProductsCount) * 100 : 0;
        score += quotedPercentage * 1000;

        return {
          supplierId,
          total,
          score,
          quotedCount,
          notAvailableCount,
          notQuotedCount,
          totalProductsCount,
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

      {/* Comparison Table */}
      {selectedSuppliersForComparison.size > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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

                        return (
                          <td
                            key={supplierId}
                            className={`px-6 py-4 whitespace-nowrap ${
                              isBestPrice
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
                                      isBestPrice
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
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Total: {quote.currency}{' '}
                                  {(Number(quote.totalPrice) || 0).toFixed(2)}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {comparisonData.reduce(
                      (sum, comp) => sum + comp.quantity,
                      0
                    )}
                  </td>
                  {Array.from(selectedSuppliersForComparison).map(
                    supplierId => {
                      const total = getTotalBySupplier(supplierId);
                      const bestTotal = getBestTotalSupplier();
                      const isBestTotal =
                        bestTotal && bestTotal.supplierId === supplierId;
                      const currency =
                        selectedSuppliers.find(
                          s => s.supplier.id === supplierId
                        )?.receivedQuotation?.items[0]?.currency || 'PEN';

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
                              {currency} {(Number(total) || 0).toFixed(2)}
                            </span>
                            {isBestTotal && (
                              <span className="text-green-500">🏆</span>
                            )}
                          </div>
                        </td>
                      );
                    }
                  )}
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
            <div className="space-y-2">
              {comparisonData.map(comparison => {
                const bestQuote = comparison.bestPrice;
                if (!bestQuote) return null;

                return (
                  <div
                    key={comparison.articleId}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-600 dark:text-gray-400">
                      {comparison.article.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {bestQuote.currency}{' '}
                        {(Number(bestQuote.unitPrice) || 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
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
                      <div className="text-xs mt-1">
                        {bestSupplierInfo.quotedCount} de{' '}
                        {bestSupplierInfo.totalProductsCount} productos
                        cotizados (
                        {bestSupplierInfo.quotedPercentage.toFixed(0)}%
                        cobertura)
                        {bestSupplierInfo.notAvailableCount > 0 && (
                          <span className="text-red-500 ml-2">
                            • {bestSupplierInfo.notAvailableCount} no
                            disponibles
                          </span>
                        )}
                        {bestSupplierInfo.notQuotedCount > 0 && (
                          <span className="text-gray-500 ml-2">
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
                const currency =
                  selectedSuppliers.find(s => s.supplier.id === supplierId)
                    ?.receivedQuotation?.items[0]?.currency || 'PEN';

                // Contar productos por estado
                const supplierQuotes = comparisonData.flatMap(comp =>
                  comp.supplierQuotes.filter(q => q.supplierId === supplierId)
                );
                const quotedCount = supplierQuotes.filter(
                  q => q.status === QuotationItemStatus.QUOTED
                ).length;
                const notAvailableCount = supplierQuotes.filter(
                  q => q.status === QuotationItemStatus.NOT_AVAILABLE
                ).length;
                const notQuotedCount = supplierQuotes.filter(
                  q => q.status === QuotationItemStatus.NOT_QUOTED
                ).length;
                const totalProductsCount = supplierQuotes.length;

                const bestPricesCount = comparisonData.filter(
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
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {supplier?.businessName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <div className="flex items-center space-x-4">
                            <span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {quotedCount}
                              </span>{' '}
                              cotizados
                            </span>
                            <span>
                              <span className="font-medium text-red-600 dark:text-red-400">
                                {notAvailableCount}
                              </span>{' '}
                              no disponibles
                            </span>
                            <span>
                              <span className="font-medium text-gray-600 dark:text-gray-400">
                                {notQuotedCount}
                              </span>{' '}
                              no cotizados
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {bestPricesCount} mejores precios de{' '}
                            {totalProductsCount} productos totales
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div
                          className={`font-bold ${
                            isBestTotal
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {currency} {(Number(total) || 0).toFixed(2)}
                        </div>
                        {isBestTotal && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Mejor total
                          </div>
                        )}
                        {quotedCount > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Solo productos cotizados
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
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onBack}>
          ← Volver
        </Button>
        <Button
          onClick={handleContinue}
          disabled={
            selectedSuppliersForComparison.size === 0 ||
            Object.keys(productSupplierSelections).length === 0
          }
        >
          Completar Selección Final
        </Button>
      </div>
    </div>
  );
};
