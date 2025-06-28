import React, { useState, useEffect, useRef } from 'react';
import {
  type SelectedSupplier,
  type QuotationOrder,
  type UpdateQuotationOrderDto,
  type SendQuotationOrderDto,
  QuotationSupplierStatus,
} from '../../../../types/quotation';
import { useQuotationService } from '../../../../hooks/useQuotationService';
import { useToast } from '../../../../contexts/ToastContext';
import { Button } from '../../../../components/common/Button';
import { FormInput } from '../../../../components/common/FormInput';
import type { Requirement } from '../../../../types/requirement';

interface GenerateOrdersProps {
  requirement: Requirement;
  selectedSuppliers: SelectedSupplier[];
  quotationRequestId: number;
  onComplete: (selectedSuppliers: SelectedSupplier[]) => void;
  onBack: () => void;
}

export const GenerateOrders: React.FC<GenerateOrdersProps> = ({
  requirement,
  selectedSuppliers,
  quotationRequestId,
  onComplete,
  onBack,
}) => {
  const [orders, setOrders] = useState<Record<number, QuotationOrder>>({});
  const [selectedProducts, setSelectedProducts] = useState<
    Record<number, Set<number>>
  >({});
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ); // 7 days from now
  const [loading, setLoading] = useState(false);
  const hasLoadedData = useRef(false);
  const [editingTerms, setEditingTerms] = useState<string>('');
  const [generalTerms, setGeneralTerms] = useState<string>(
    'Términos estándar de cotización'
  );

  const {
    updateQuotationOrder,
    sendQuotationOrder,
    applyGeneralTermsToAll,
    getQuotationByRequirement,
    error,
  } = useQuotationService();
  const { showSuccess, showError } = useToast();

  // Load existing quotation data when component mounts (only once)
  useEffect(() => {
    const loadExistingData = async () => {
      // Solo cargar una vez y solo si no hay datos locales
      if (
        !hasLoadedData.current &&
        Object.keys(orders).length === 0 &&
        Object.keys(selectedProducts).length === 0
      ) {
        hasLoadedData.current = true;

        const existingQuotation = await getQuotationByRequirement(
          requirement.id
        );

        if (existingQuotation) {
          // Initialize orders from existing quotation suppliers
          const initialOrders: Record<number, QuotationOrder> = {};
          const initialSelectedProducts: Record<number, Set<number>> = {};

          existingQuotation.quotationSuppliers.forEach(quotationSupplier => {
            const supplierId = quotationSupplier.supplier.id;

            // Initialize order if it exists
            if (quotationSupplier.quotationSupplierArticles.length > 0) {
              const orderNumber = `OC-${requirement.code}-${supplierId}-${Date.now()}`;

              initialOrders[supplierId] = {
                id: Date.now(),
                supplierId,
                requirementId: requirement.id,
                orderNumber,
                terms:
                  quotationSupplier.terms || 'Términos estándar de cotización',
                deadline: new Date(deadline),
                status: quotationSupplier.status,
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              // Initialize selected products from existing data
              const selectedArticleIds = new Set(
                quotationSupplier.quotationSupplierArticles.map(
                  qsa => qsa.requirementArticle.id
                )
              );
              initialSelectedProducts[supplierId] = selectedArticleIds;
            }
          });

          setOrders(initialOrders);
          setSelectedProducts(initialSelectedProducts);
        }
      }
    };

    loadExistingData();
  }, [requirement.id, getQuotationByRequirement, deadline]);

  // Initialize orders from existing quotation suppliers (fallback)
  useEffect(() => {
    const initialOrders: Record<number, QuotationOrder> = {};
    selectedSuppliers.forEach(supplier => {
      if (supplier.quotationOrder) {
        initialOrders[supplier.supplier.id] = supplier.quotationOrder;
      }
    });
    setOrders(prev => ({ ...prev, ...initialOrders }));
  }, [selectedSuppliers]);

  const handleEditTerms = (supplierId: number) => {
    const currentOrder = orders[supplierId];
    setEditingTerms(currentOrder?.terms || 'Términos estándar de cotización');
    setEditingOrder(supplierId);
  };

  const handleSaveTerms = async (supplierId: number, terms: string) => {
    const existingOrder = orders[supplierId];
    const orderNumber =
      existingOrder?.orderNumber ||
      `OC-${requirement.code}-${supplierId}-${Date.now()}`;
    const selectedArticles = Array.from(selectedProducts[supplierId] || []);

    const updateData: UpdateQuotationOrderDto = {
      supplierId,
      orderNumber,
      terms,
      selectedArticles,
    };

    const result = await updateQuotationOrder(quotationRequestId, updateData);
    if (result) {
      setOrders(prev => ({
        ...prev,
        [supplierId]: {
          ...(existingOrder || {
            id: Date.now(),
            supplierId,
            requirementId: requirement.id,
            orderNumber,
            deadline: new Date(deadline),
            status: QuotationSupplierStatus.PENDING,
            createdAt: new Date(),
          }),
          terms,
          updatedAt: new Date(),
        },
      }));

      showSuccess(
        'Términos actualizados',
        `Términos para ${selectedSuppliers.find(s => s.supplier.id === supplierId)?.supplier.businessName} actualizados exitosamente`
      );
      setEditingOrder(null);
    } else {
      showError(
        'Error al actualizar términos',
        error || 'No se pudieron actualizar los términos. Inténtalo de nuevo.'
      );
    }
  };

  const handleExportPDF = (supplierId: number) => {
    // Simular exportación de PDF
    console.log(`Exportando PDF para proveedor ${supplierId}`);
    showSuccess(
      'PDF generado',
      'El PDF se ha generado correctamente (simulación)'
    );
  };

  const handleSaveOrder = async (supplierId: number) => {
    const order = orders[supplierId];
    if (!order) return;

    const updateData: UpdateQuotationOrderDto = {
      supplierId,
      orderNumber: order.orderNumber,
      terms: order.terms,
      selectedArticles: Array.from(selectedProducts[supplierId] || []),
    };

    const result = await updateQuotationOrder(quotationRequestId, updateData);
    if (result) {
      setOrders(prev => ({
        ...prev,
        [supplierId]: {
          ...prev[supplierId]!,
          status: QuotationSupplierStatus.PENDING,
          updatedAt: new Date(),
        },
      }));

      showSuccess(
        'Orden guardada',
        `Orden para ${selectedSuppliers.find(s => s.supplier.id === supplierId)?.supplier.businessName} guardada exitosamente`
      );
    } else {
      showError(
        'Error al guardar orden',
        error || 'No se pudo guardar la orden. Inténtalo de nuevo.'
      );
    }
  };

  const handleSendOrder = async (supplierId: number) => {
    const order = orders[supplierId];
    if (!order) return;

    const sendData: SendQuotationOrderDto = {
      supplierId,
      orderNumber: order.orderNumber,
      terms: order.terms,
    };

    const result = await sendQuotationOrder(quotationRequestId, sendData);
    if (result) {
      setOrders(prev => ({
        ...prev,
        [supplierId]: {
          ...prev[supplierId]!,
          status: QuotationSupplierStatus.SENT,
          updatedAt: new Date(),
        },
      }));

      showSuccess(
        'Orden enviada',
        `Orden para ${selectedSuppliers.find(s => s.supplier.id === supplierId)?.supplier.businessName} enviada exitosamente`
      );
    } else {
      showError(
        'Error al enviar orden',
        error || 'No se pudo enviar la orden. Inténtalo de nuevo.'
      );
    }
  };

  const handleApplyStandardTermsToAll = async () => {
    setLoading(true);

    try {
      // Seleccionar todos los artículos para todos los proveedores
      const allRequirementArticleIds = new Set(
        requirement.requirementArticles.map(ra => ra.id)
      );

      const newSelectedProducts: Record<number, Set<number>> = {};

      // Aplicar términos generales y guardar para cada proveedor
      for (const selectedSupplier of selectedSuppliers) {
        const supplierId = selectedSupplier.supplier.id;

        // Seleccionar todos los artículos para este proveedor
        newSelectedProducts[supplierId] = allRequirementArticleIds;

        // Crear o actualizar la orden con términos generales
        const orderNumber = `OC-${requirement.code}-${supplierId}-${Date.now()}`;

        const updateData: UpdateQuotationOrderDto = {
          supplierId,
          orderNumber,
          terms: generalTerms,
          selectedArticles: Array.from(allRequirementArticleIds),
        };

        const result = await updateQuotationOrder(
          quotationRequestId,
          updateData
        );

        if (result) {
          // Actualizar el estado local
          setOrders(prev => ({
            ...prev,
            [supplierId]: {
              id: Date.now(),
              supplierId,
              requirementId: requirement.id,
              orderNumber,
              terms: generalTerms,
              deadline: new Date(deadline),
              status: QuotationSupplierStatus.PENDING,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          }));
        }
      }

      // Actualizar el estado de productos seleccionados
      setSelectedProducts(newSelectedProducts);

      showSuccess(
        'Términos aplicados',
        'Se han aplicado los términos generales y guardado todas las órdenes con todos los artículos seleccionados'
      );
    } catch {
      showError(
        'Error al aplicar términos',
        'No se pudieron aplicar los términos generales a todas las órdenes'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyGeneralTermsToAll = async () => {
    setLoading(true);

    try {
      // Aplicar términos generales a todas las órdenes existentes en una sola llamada
      const result = await applyGeneralTermsToAll(quotationRequestId, {
        terms: generalTerms,
        selectedArticles: Array.from(
          new Set(requirement.requirementArticles.map(ra => ra.id))
        ),
      });

      if (result) {
        // Actualizar el estado local con los datos de la respuesta
        const updatedQuotation = result;

        // Actualizar órdenes locales
        const newOrders: Record<number, QuotationOrder> = {};
        const newSelectedProducts: Record<number, Set<number>> = {};

        updatedQuotation.quotationSuppliers.forEach(quotationSupplier => {
          const supplierId = quotationSupplier.supplier.id;

          // Actualizar orden
          newOrders[supplierId] = {
            id: quotationSupplier.id,
            supplierId,
            requirementId: requirement.id,
            orderNumber: quotationSupplier.orderNumber || '',
            terms: quotationSupplier.terms || '',
            deadline: new Date(deadline),
            status: quotationSupplier.status,
            createdAt: new Date(quotationSupplier.createdAt),
            updatedAt: new Date(quotationSupplier.updatedAt),
          };

          // Actualizar productos seleccionados
          const selectedArticleIds = new Set(
            quotationSupplier.quotationSupplierArticles.map(
              qsa => qsa.requirementArticle.id
            )
          );
          newSelectedProducts[supplierId] = selectedArticleIds;
        });

        setOrders(newOrders);
        setSelectedProducts(newSelectedProducts);

        showSuccess(
          'Términos aplicados',
          'Se han aplicado los términos generales y guardado todas las órdenes con todos los artículos seleccionados'
        );
      }
    } catch {
      showError(
        'Error al aplicar términos',
        'No se pudieron aplicar los términos generales a todas las órdenes'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProductToggle = (
    supplierId: number,
    requirementArticleId: number
  ) => {
    setSelectedProducts(prev => {
      const currentSelection = prev[supplierId] || new Set();
      const newSelection = new Set(currentSelection);

      if (newSelection.has(requirementArticleId)) {
        newSelection.delete(requirementArticleId);
      } else {
        newSelection.add(requirementArticleId);
      }

      return {
        ...prev,
        [supplierId]: newSelection,
      };
    });
  };

  const handleSelectAllProducts = (supplierId: number) => {
    const allRequirementArticleIds = new Set(
      requirement.requirementArticles.map(ra => ra.id)
    );
    setSelectedProducts(prev => ({
      ...prev,
      [supplierId]: allRequirementArticleIds,
    }));
  };

  const handleDeselectAllProducts = (supplierId: number) => {
    setSelectedProducts(prev => ({
      ...prev,
      [supplierId]: new Set(),
    }));
  };

  const handleContinue = () => {
    const updatedSuppliers = selectedSuppliers.map(supplier => ({
      ...supplier,
      quotationOrder: orders[supplier.supplier.id],
    }));
    if (
      Object.values(orders).filter(
        o => o.status === QuotationSupplierStatus.SENT
      ).length !== selectedSuppliers.length
    ) {
      showError(
        'Error',
        'Debe enviar todas las órdenes para continuar con el proceso de cotización'
      );
      return;
    }

    onComplete(updatedSuppliers);
  };

  const getOrderStatus = (supplierId: number) => {
    const order = orders[supplierId];
    if (!order) return 'PENDIENTE';
    return order.status === QuotationSupplierStatus.PENDING
      ? 'GUARDADA'
      : order.status === QuotationSupplierStatus.SENT
        ? 'ENVIADA'
        : 'BORRADOR';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GUARDADA':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'BORRADOR':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'ENVIADA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSelectedProductsCount = (supplierId: number) => {
    return selectedProducts[supplierId]?.size || 0;
  };

  const getTotalSelectedQuantity = (supplierId: number) => {
    const selectedIds = selectedProducts[supplierId] || new Set();
    return requirement.requirementArticles
      .filter(ra => selectedIds.has(ra.id))
      .reduce((total, ra) => +total + +ra.quantity, 0);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Generar Órdenes de Cotización
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Revisa y personaliza las órdenes de cotización para cada proveedor
          seleccionado
        </p>
      </div>

      {/* Global Settings */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
          Configuración General
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Fecha límite de cotización"
              type="date"
              value={deadline.toISOString().split('T')[0]}
              onChange={e => setDeadline(new Date(e.target.value))}
            />
          </div>
          <div className="space-y-3">
            <FormInput
              label="Términos generales de cotización"
              type="textarea"
              value={generalTerms}
              onChange={e => setGeneralTerms(e.target.value)}
              placeholder="Ingresa los términos generales que se aplicarán a todas las órdenes..."
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleApplyGeneralTermsToAll}
                disabled={loading}
                className="text-sm bg-blue-500 text-white"
              >
                {loading ? 'Aplicando...' : 'Aplicar términos y crear órdenes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {selectedSuppliers.map(selectedSupplier => {
          const supplier = selectedSupplier.supplier;
          const order = orders[supplier.id];
          const status = getOrderStatus(supplier.id);
          const isEditing = editingOrder === supplier.id;
          const selectedCount = getSelectedProductsCount(supplier.id);
          const totalQuantity = getTotalSelectedQuantity(supplier.id);

          return (
            <div
              key={supplier.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
            >
              {/* Supplier Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {supplier.businessName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      RUC: {supplier.ruc}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <FormInput
                      label="Términos de cotización"
                      type="textarea"
                      value={editingTerms}
                      onChange={e => setEditingTerms(e.target.value)}
                      placeholder="Ingresa los términos específicos para este proveedor..."
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={() =>
                          handleSaveTerms(supplier.id, editingTerms)
                        }
                        className="text-sm"
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingOrder(null)}
                        className="text-sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Order Preview */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vista previa de la orden
                      </h5>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>
                          <strong>Número:</strong>{' '}
                          {order?.orderNumber || 'Pendiente de generar'}
                        </div>
                        <div>
                          <strong>Fecha límite:</strong>{' '}
                          {deadline.toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Productos seleccionados:</strong>{' '}
                          {selectedCount} de{' '}
                          {requirement.requirementArticles.length} artículos
                        </div>
                        <div>
                          <strong>Cantidad total:</strong> {totalQuantity}{' '}
                          unidades
                        </div>
                        <div>
                          <strong>Términos:</strong>{' '}
                          {order?.terms || 'No definidos'}
                        </div>
                      </div>
                    </div>

                    {/* Product Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Seleccionar productos
                        </h5>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => handleSelectAllProducts(supplier.id)}
                            className="text-xs"
                          >
                            Seleccionar todos
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleDeselectAllProducts(supplier.id)
                            }
                            className="text-xs"
                          >
                            Deseleccionar
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded">
                        {requirement.requirementArticles.map(
                          (article, index) => {
                            const isSelected =
                              selectedProducts[supplier.id]?.has(article.id) ||
                              false;
                            return (
                              <div
                                key={index}
                                className={`flex items-center space-x-3 p-2 text-xs border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                                  isSelected
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    handleProductToggle(supplier.id, article.id)
                                  }
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {article.article.name}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400">
                                    {article.article.code} - {article.quantity}{' '}
                                    unidades
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleEditTerms(supplier.id)}
                        className="text-xs"
                      >
                        ✏️ Editar términos
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleExportPDF(supplier.id)}
                        className="text-xs"
                        disabled={!order || selectedCount === 0}
                      >
                        📄 Exportar PDF
                      </Button>
                      <Button
                        onClick={() => handleSaveOrder(supplier.id)}
                        className="text-xs"
                        disabled={!order || selectedCount === 0}
                      >
                        💾 Guardar
                      </Button>
                      <Button
                        onClick={() => handleSendOrder(supplier.id)}
                        className="text-xs"
                        disabled={
                          !order ||
                          selectedCount === 0 ||
                          order.status === 'SENT'
                        }
                        variant={
                          order?.status === 'SENT' ? 'outline' : 'primary'
                        }
                      >
                        {order?.status === 'SENT' ? '✅ Enviada' : '📤 Enviar'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Total proveedores:
            </span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {selectedSuppliers.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Órdenes generadas:
            </span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {Object.keys(orders).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Enviadas:</span>
            <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
              {
                Object.values(orders).filter(
                  o => o.status === QuotationSupplierStatus.SENT
                ).length
              }
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Guardadas:</span>
            <span className="ml-2 font-medium text-green-600 dark:text-green-400">
              {
                Object.values(orders).filter(
                  o => o.status === QuotationSupplierStatus.PENDING
                ).length
              }
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Sin guardar:
            </span>
            <span className="ml-2 font-medium text-yellow-600 dark:text-yellow-400">
              {selectedSuppliers.length - Object.keys(orders).length}
            </span>
          </div>
        </div>

        {/* Send All Orders Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleApplyStandardTermsToAll}
            disabled={Object.keys(orders).length === 0 || loading}
            className="text-sm"
          >
            {loading ? 'Enviando...' : '📤 Enviar todas las órdenes'}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onBack}>
          ← Volver
        </Button>
        <Button
          onClick={handleContinue}
          disabled={Object.keys(orders).length === 0}
        >
          Continuar al siguiente paso
        </Button>
      </div>
    </div>
  );
};
