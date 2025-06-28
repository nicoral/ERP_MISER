import React, { useState, useMemo, useEffect } from 'react';
import {
  type ProductSelection,
  type SelectedSupplier,
  type CreateFinalSelectionDto,
} from '../../../../types/quotation';
import { useQuotationService } from '../../../../hooks/useQuotationService';
import { useToast } from '../../../../contexts/ToastContext';
import { Button } from '../../../../components/common/Button';
import { FormInput } from '../../../../components/common/FormInput';
import type { Requirement } from '../../../../types/requirement';

interface FinalSelectionProps {
  requirement: Requirement;
  selectedSuppliers: SelectedSupplier[];
  quotationRequestId: number;
  onComplete: (selectedSuppliers: SelectedSupplier[]) => void;
  onBack: () => void;
}

export const FinalSelection: React.FC<FinalSelectionProps> = ({
  requirement,
  selectedSuppliers,
  quotationRequestId,
  onComplete,
  onBack,
}) => {
  const [internalNotes, setInternalNotes] = useState('');
  const [productSelections, setProductSelections] = useState<
    Record<number, number>
  >({});
  const [loading, setLoading] = useState(false);
  const [selectedProductsBySupplier, setSelectedProductsBySupplier] = useState<
    Record<number, number[]>
  >({});

  const { createFinalSelection, getQuotationByRequirement, error } =
    useQuotationService();
  const { showSuccess, showError } = useToast();

  // Helper function to safely format numbers
  const formatNumber = (
    value: number | undefined | null,
    decimals: number = 2
  ): string => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(decimals);
    }
    return '0.00';
  };

  // Cargar productos seleccionados desde el backend
  useEffect(() => {
    const loadSelectedProducts = async () => {
      try {
        const existingQuotation = await getQuotationByRequirement(
          requirement.id
        );
        if (existingQuotation) {
          const productsBySupplier: Record<number, number[]> = {};

          existingQuotation.quotationSuppliers.forEach(quotationSupplier => {
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
        selectedSuppliers.forEach(supplier => {
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

  // Generar selecciones automáticas basadas en mejores precios
  const autoSelections = useMemo(() => {
    const selections: Record<number, number> = {};
    const quotedProducts = getAllQuotedProducts();

    quotedProducts.forEach(requirementArticle => {
      let bestPrice = Infinity;
      let bestSupplierId = 0;

      selectedSuppliers.forEach(selectedSupplier => {
        const quotation = selectedSupplier.receivedQuotation;
        if (quotation) {
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
            if (item && item.unitPrice && item.unitPrice < bestPrice) {
              bestPrice = item.unitPrice;
              bestSupplierId = selectedSupplier.supplier.id;
            }
          }
        }
      });

      if (bestSupplierId > 0) {
        selections[requirementArticle.article.id] = bestSupplierId;
      }
    });

    return selections;
  }, [requirement, selectedSuppliers, selectedProductsBySupplier]);

  // Aplicar selecciones automáticas al cargar
  React.useEffect(() => {
    setProductSelections(autoSelections);
  }, [autoSelections]);

  const handleProductSelection = (articleId: number, supplierId: number) => {
    setProductSelections(prev => ({
      ...prev,
      [articleId]: supplierId,
    }));
  };

  const handleGeneratePurchaseOrder = async () => {
    setLoading(true);

    try {
      const finalSelections: ProductSelection[] = [];
      const quotedProducts = getAllQuotedProducts();

      // Validar que todos los productos cotizados tengan un proveedor seleccionado
      const unselectedProducts = quotedProducts.filter(
        ra => !productSelections[ra.article.id]
      );

      if (unselectedProducts.length > 0) {
        showError(
          'Productos sin seleccionar',
          `Debes seleccionar un proveedor para: ${unselectedProducts
            .map(ra => ra.article.name)
            .join(', ')}`
        );
        setLoading(false);
        return;
      }

      quotedProducts.forEach(requirementArticle => {
        const selectedSupplierId =
          productSelections[requirementArticle.article.id];
        if (selectedSupplierId) {
          const selectedSupplier = selectedSuppliers.find(
            s => s.supplier.id === selectedSupplierId
          );
          const quotation = selectedSupplier?.receivedQuotation;

          if (quotation) {
            const item = quotation.items.find(
              i => i.article.id === requirementArticle.article.id
            );
            if (item) {
              finalSelections.push({
                articleId: requirementArticle.article.id,
                article: requirementArticle.article,
                quantity: requirementArticle.quantity,
                selectedSupplierId,
                selectedSupplier: selectedSupplier!.supplier,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                currency: item.currency,
                deliveryTime: item.deliveryTime,
                notes: item.notes,
                requirementArticleId: requirementArticle.id,
              });
            }
          }
        }
      });

      if (finalSelections.length === 0) {
        showError(
          'No hay productos para seleccionar',
          'No se encontraron productos cotizados válidos para crear la selección final.'
        );
        setLoading(false);
        return;
      }

      // Crear la selección final en el backend
      const createData: CreateFinalSelectionDto = {
        quotationRequestId: quotationRequestId.toString(),
        notes: internalNotes,
        items: finalSelections.map(selection => ({
          articleId: selection.requirementArticleId.toString(),
          supplierId: selection.selectedSupplierId.toString(),
          selectedPrice: selection.unitPrice || 0,
          notes: selection.notes || '',
        })),
      };

      console.log('Creating final selection with data:', createData);

      const createdFinalSelection = await createFinalSelection(createData);

      if (createdFinalSelection) {
        // Actualizar proveedores seleccionados
        const updatedSuppliers = selectedSuppliers.map(supplier => ({
          ...supplier,
          isFinalSelected: finalSelections.some(
            selection => selection.selectedSupplierId === supplier.supplier.id
          ),
        }));

        showSuccess(
          'Selección final creada',
          `Se ha creado la selección final con ${finalSelections.length} productos seleccionados`
        );

        onComplete(updatedSuppliers);
      } else {
        showError(
          'Error al crear selección final',
          error || 'No se pudo crear la selección final. Inténtalo de nuevo.'
        );
      }
    } catch (error) {
      console.error('Error creating final selection:', error);
      showError(
        'Error al crear selección final',
        'Ocurrió un error inesperado. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getSupplierForArticle = (articleId: number) => {
    const supplierId = productSelections[articleId];
    return selectedSuppliers.find(s => s.supplier.id === supplierId);
  };

  const getTotalAmount = () => {
    const quotedProducts = getAllQuotedProducts();
    return quotedProducts.reduce((total, requirementArticle) => {
      const selectedSupplier = getSupplierForArticle(
        requirementArticle.article.id
      );
      const quotation = selectedSupplier?.receivedQuotation;
      if (quotation) {
        const item = quotation.items.find(
          i => i.article.id === requirementArticle.article.id
        );
        if (item) {
          return (
            total + (typeof item.totalPrice === 'number' ? item.totalPrice : 0)
          );
        }
      }
      return total;
    }, 0);
  };

  const getCurrency = () => {
    const firstSelection = Object.values(productSelections)[0];
    if (firstSelection) {
      const supplier = selectedSuppliers.find(
        s => s.supplier.id === firstSelection
      );
      return supplier?.receivedQuotation?.currency || 'PEN';
    }
    return 'PEN';
  };

  const quotedProducts = getAllQuotedProducts();

  // Validar si hay productos cotizados
  if (quotedProducts.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              No hay productos cotizados
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-4">
              No se encontraron productos que hayan sido cotizados por los
              proveedores seleccionados.
            </p>
            <Button variant="outline" onClick={onBack}>
              ← Volver al paso anterior
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Selección Final de Proveedores
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Revisa y confirma la selección final de proveedores para los productos
          específicamente cotizados
        </p>
      </div>

      {/* Auto-selection Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-blue-500">💡</span>
          <span className="text-sm text-blue-900 dark:text-blue-100">
            Se han aplicado automáticamente las mejores opciones de precio para
            los productos cotizados. Puedes modificar las selecciones según tus
            criterios.
          </span>
        </div>
      </div>

      {/* Product Selections */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Selección por Producto
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Solo se muestran los productos que fueron cotizados por al menos un
            proveedor
          </p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Proveedor Seleccionado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Precio Unitario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {quotedProducts.map(requirementArticle => {
                const selectedSupplier = getSupplierForArticle(
                  requirementArticle.article.id
                );
                const quotation = selectedSupplier?.receivedQuotation;
                const item = quotation?.items.find(
                  i => i.article.id === requirementArticle.article.id
                );

                return (
                  <tr key={requirementArticle.article.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {requirementArticle.article.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {requirementArticle.article.code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {requirementArticle.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={
                          productSelections[requirementArticle.article.id] || ''
                        }
                        onChange={e =>
                          handleProductSelection(
                            requirementArticle.article.id,
                            Number(e.target.value)
                          )
                        }
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Seleccionar proveedor</option>
                        {selectedSuppliers
                          .filter(s => s.receivedQuotation)
                          .map(supplier => {
                            const supplierQuotation =
                              supplier.receivedQuotation;
                            const supplierItem = supplierQuotation?.items.find(
                              i =>
                                i.article.id === requirementArticle.article.id
                            );

                            // Verificar si este producto fue seleccionado para este proveedor
                            const selectedProducts =
                              getSelectedProductsForSupplier(
                                supplier.supplier.id
                              );
                            const isProductSelected = selectedProducts.some(
                              ra =>
                                ra.article.id === requirementArticle.article.id
                            );

                            if (!isProductSelected) return null;

                            return (
                              <option
                                key={supplier.supplier.id}
                                value={supplier.supplier.id}
                              >
                                {supplier.supplier.businessName} -{' '}
                                {supplierItem?.currency || 'PEN'}{' '}
                                {formatNumber(supplierItem?.unitPrice)}
                              </option>
                            );
                          })
                          .filter(Boolean)}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item ? (
                        <span className="font-medium">
                          {item.currency} {formatNumber(item.unitPrice)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item ? (
                        <span className="font-medium">
                          {item.currency} {formatNumber(item.totalPrice)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item && (
                        <div className="flex items-center space-x-2">
                          {item.deliveryTime && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              📦 {item.deliveryTime}d
                            </span>
                          )}
                          {item.notes && (
                            <span
                              className="text-xs text-gray-500 dark:text-gray-400"
                              title={item.notes}
                            >
                              💬
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Selected Suppliers Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Proveedores Seleccionados
          </h4>
          <div className="space-y-2">
            {Array.from(new Set(Object.values(productSelections))).map(
              supplierId => {
                const supplier = selectedSuppliers.find(
                  s => s.supplier.id === supplierId
                );
                if (!supplier) return null;

                const supplierArticles = quotedProducts.filter(
                  ra => productSelections[ra.article.id] === supplierId
                );

                return (
                  <div
                    key={supplierId}
                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {supplier.supplier.businessName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {supplierArticles.length} producto(s) seleccionado(s)
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Resumen Financiero
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Productos cotizados:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {quotedProducts.length} de{' '}
                {requirement.requirementArticles.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Productos seleccionados:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Object.keys(productSelections).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Proveedores seleccionados:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Set(Object.values(productSelections)).size}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  Total estimado:
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {getCurrency()} {formatNumber(getTotalAmount())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Notas Internas
        </h4>
        <FormInput
          type="textarea"
          value={internalNotes}
          onChange={e => setInternalNotes(e.target.value)}
          placeholder="Ingresa notas internas sobre la selección de proveedores..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          ← Volver
        </Button>
        <Button
          onClick={handleGeneratePurchaseOrder}
          disabled={Object.keys(productSelections).length === 0 || loading}
        >
          {loading ? '🔄 Creando...' : '🛒 Generar Orden de Compra Final'}
        </Button>
      </div>
    </div>
  );
};
