import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  type SelectedSupplier,
  type QuotationOrder,
  type UpdateQuotationOrderDto,
  type SendQuotationOrderDto,
  QuotationSupplierStatus,
  type QuotationRequest,
} from '../../../../types/quotation';
import { useQuotationService } from '../../../../hooks/useQuotationService';
import { useToast } from '../../../../contexts/ToastContext';
import { Button } from '../../../../components/common/Button';
import { FormInput } from '../../../../components/common/FormInput';
import type { Requirement } from '../../../../types/requirement';
import { quotationService } from '../../../../services/api/quotationService';
import { Loader2 } from 'lucide-react';

interface GenerateOrdersProps {
  requirement: Requirement;
  quotationRequest: QuotationRequest;
  onComplete: (selectedSuppliers: SelectedSupplier[]) => void;
  onBack: () => void;
}

// Tipos para el estado de carga
interface LoadingStates {
  savingTerms: number | null;
  exportingPdf: number | null;
  savingOrder: number | null;
  sendingOrder: number | null;
  applyingGeneralTerms: boolean;
  sendingAllOrders: boolean;
}

// Componente para mostrar el estado de una orden
const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
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

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
    >
      {status}
    </span>
  );
};

// Componente para la selección de artículos
const ArticleSelection: React.FC<{
  supplierId: number;
  requirementArticles: Requirement['requirementArticles'];
  selectedArticles: Set<number>;
  onArticleToggle: (supplierId: number, articleId: number) => void;
  onSelectAll: (supplierId: number) => void;
  onDeselectAll: (supplierId: number) => void;
}> = ({
  supplierId,
  requirementArticles,
  selectedArticles,
  onArticleToggle,
  onSelectAll,
  onDeselectAll,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Seleccionar artículos
        </h5>
        <div className="flex space-x-2">
          <Button onClick={() => onSelectAll(supplierId)} className="text-xs">
            Seleccionar todos
          </Button>
          <Button onClick={() => onDeselectAll(supplierId)} className="text-xs">
            Deseleccionar
          </Button>
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded">
        {requirementArticles.map(article => {
          const isSelected = selectedArticles.has(article.id);
          return (
            <div
              key={article.id}
              className={`flex items-center space-x-3 p-2 text-xs border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onArticleToggle(supplierId, article.id)}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {article.article.name}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {article.article.code} - {article.quantity} unidades
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente para la selección de servicios
const ServiceSelection: React.FC<{
  supplierId: number;
  requirementServices: Requirement['requirementServices'];
  selectedServices: Set<number>;
  onServiceToggle: (supplierId: number, serviceId: number) => void;
  onSelectAll: (supplierId: number) => void;
  onDeselectAll: (supplierId: number) => void;
}> = ({
  supplierId,
  requirementServices,
  selectedServices,
  onServiceToggle,
  onSelectAll,
  onDeselectAll,
}) => {
  if (!requirementServices || requirementServices.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Seleccionar servicios
        </h5>
        <div className="flex space-x-2">
          <Button onClick={() => onSelectAll(supplierId)} className="text-xs">
            Seleccionar todos
          </Button>
          <Button onClick={() => onDeselectAll(supplierId)} className="text-xs">
            Deseleccionar
          </Button>
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded">
        {requirementServices.map(service => {
          const isSelected = selectedServices.has(service.id);
          return (
            <div
              key={service.id}
              className={`flex items-center space-x-3 p-2 text-xs border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                isSelected ? 'bg-green-50 dark:bg-green-900/20' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onServiceToggle(supplierId, service.id)}
                className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {service.service.name}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {service.service.code} - {service.duration}{' '}
                  {service.durationType}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente para la vista previa de la orden
const OrderPreview: React.FC<{
  order: QuotationOrder | undefined;
  deadline: Date;
  selectedArticlesCount: number;
  selectedServicesCount: number;
  totalArticles: number;
  totalServices: number;
  orderNumber: string | undefined;
}> = ({
  order,
  deadline,
  selectedArticlesCount,
  selectedServicesCount,
  totalArticles,
  totalServices,
  orderNumber,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        Vista previa de la orden
      </h5>
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div>
          <strong>Número:</strong> {orderNumber || 'Pendiente de generar'}
        </div>
        <div>
          <strong>Fecha límite:</strong> {deadline.toLocaleDateString()}
        </div>
        {totalArticles > 0 && (
          <div>
            <strong>Artículos seleccionados:</strong> {selectedArticlesCount} de{' '}
            {totalArticles} artículos
          </div>
        )}
        {totalServices > 0 && (
          <div>
            <strong>Servicios seleccionados:</strong> {selectedServicesCount} de{' '}
            {totalServices} servicios
          </div>
        )}
        <div>
          <strong>Términos:</strong> {order?.terms || 'No definidos'}
        </div>
      </div>
    </div>
  );
};

// Componente para los botones de acción
const ActionButtons: React.FC<{
  supplierId: number;
  order: QuotationOrder | undefined;
  selectedArticlesCount: number;
  selectedServicesCount: number;
  loadingStates: LoadingStates;
  onEditTerms: (supplierId: number) => void;
  onExportPDF: (supplierId: number) => void;
  onSaveOrder: (supplierId: number) => void;
  onSendOrder: (supplierId: number) => void;
}> = ({
  supplierId,
  order,
  selectedArticlesCount,
  selectedServicesCount,
  loadingStates,
  onEditTerms,
  onExportPDF,
  onSaveOrder,
  onSendOrder,
}) => {
  const totalSelected = selectedArticlesCount + selectedServicesCount;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => onEditTerms(supplierId)}
        className="text-xs"
        disabled={loadingStates.savingTerms === supplierId}
      >
        ✏️ Editar términos
      </Button>
      <Button
        onClick={() => onExportPDF(supplierId)}
        className="text-xs"
        disabled={
          !order ||
          totalSelected === 0 ||
          loadingStates.exportingPdf === supplierId
        }
      >
        {loadingStates.exportingPdf === supplierId ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Generando PDF...
          </>
        ) : (
          '📄 Exportar PDF'
        )}
      </Button>
      <Button
        onClick={() => onSaveOrder(supplierId)}
        className="text-xs"
        disabled={
          totalSelected === 0 || loadingStates.savingOrder === supplierId
        }
      >
        {loadingStates.savingOrder === supplierId ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Guardando...
          </>
        ) : (
          '💾 Guardar'
        )}
      </Button>
      <Button
        onClick={() => onSendOrder(supplierId)}
        className="text-xs"
        disabled={
          !order ||
          totalSelected === 0 ||
          loadingStates.sendingOrder === supplierId
        }
        variant={order?.status === 'SENT' ? 'outline' : 'primary'}
      >
        {loadingStates.sendingOrder === supplierId ? (
          <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Enviando...
          </>
        ) : order?.status === 'SENT' ? (
          '✅ Enviada'
        ) : (
          '📤 Enviar'
        )}
      </Button>
    </div>
  );
};

export const GenerateOrders: React.FC<GenerateOrdersProps> = ({
  requirement,
  quotationRequest,
  onComplete,
  onBack,
}) => {
  // Extraer selectedSuppliers y quotationRequestId de quotationRequest
  const selectedSuppliers: SelectedSupplier[] =
    quotationRequest.quotationSuppliers
      .filter(qs => qs.supplier)
      .map(qs => ({
        supplier: qs.supplier,
        isSelected: true,
        quotationOrder:
          qs.orderNumber || qs.terms
            ? {
                id: qs.id,
                supplierId: qs.supplier.id,
                requirementId: quotationRequest.requirement.id,
                orderNumber: qs.orderNumber || '',
                terms: qs.terms || '',
                deadline: qs.sentAt ? new Date(qs.sentAt) : new Date(),
                status: qs.status,
                createdAt: new Date(qs.createdAt),
                updatedAt: new Date(qs.updatedAt),
              }
            : undefined,
      }));

  const quotationRequestId = quotationRequest.id;

  // Estados principales
  const [orders, setOrders] = useState<Record<number, QuotationOrder>>({});
  const [selectedArticles, setSelectedArticles] = useState<
    Record<number, Set<number>>
  >({});
  const [selectedServices, setSelectedServices] = useState<
    Record<number, Set<number>>
  >({});
  const [editingOrder, setEditingOrder] = useState<number | null>(null);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [editingTerms, setEditingTerms] = useState<string>('');
  const [generalTerms, setGeneralTerms] = useState<string>(
    'Términos estándar de cotización'
  );

  // Estados de carga optimizados
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    savingTerms: null,
    exportingPdf: null,
    savingOrder: null,
    sendingOrder: null,
    applyingGeneralTerms: false,
    sendingAllOrders: false,
  });

  // Flag para evitar cargas múltiples
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const {
    updateQuotationOrder,
    sendQuotationOrder,
    applyGeneralTermsToAll,
    sendAllQuotationOrders,
    error,
  } = useQuotationService();
  const { showSuccess, showError } = useToast();

  // Memoizar valores calculados
  const totalArticles = useMemo(
    () => requirement.requirementArticles.length,
    [requirement.requirementArticles]
  );

  // Cargar datos existentes desde las props
  useEffect(() => {
    if (hasLoadedData || Object.keys(orders).length > 0) return;

    setHasLoadedData(true);

    if (quotationRequest) {
      const initialOrders: Record<number, QuotationOrder> = {};
      const initialSelectedArticles: Record<number, Set<number>> = {};
      const initialSelectedServices: Record<number, Set<number>> = {};

      quotationRequest.quotationSuppliers.forEach(quotationSupplier => {
        const supplierId = quotationSupplier.supplier.id;

        if (quotationSupplier.quotationSupplierArticles.length > 0) {
          initialSelectedArticles[supplierId] = new Set(
            quotationSupplier.quotationSupplierArticles.map(
              qsa => qsa.requirementArticle.id
            )
          );
        } else {
          initialSelectedArticles[supplierId] = new Set();
        }

        if (
          quotationSupplier.quotationSupplierServices &&
          quotationSupplier.quotationSupplierServices.length > 0
        ) {
          initialSelectedServices[supplierId] = new Set(
            quotationSupplier.quotationSupplierServices.map(
              qss => qss.requirementService.id
            )
          );
        } else {
          initialSelectedServices[supplierId] = new Set();
        }

        initialOrders[supplierId] = {
          id: Date.now(),
          supplierId,
          requirementId: quotationRequest.requirement.id,
          orderNumber: quotationSupplier.orderNumber,
          terms: quotationSupplier.terms || 'Términos estándar de cotización',
          deadline: new Date(deadline),
          status: quotationSupplier.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      setOrders(initialOrders);
      setSelectedArticles(initialSelectedArticles);
      setSelectedServices(initialSelectedServices);
    }
  }, [quotationRequest, requirement.id, deadline, hasLoadedData]);

  // Callbacks optimizados
  const handleEditTerms = useCallback(
    (supplierId: number) => {
      const currentOrder = orders[supplierId];
      setEditingTerms(currentOrder?.terms || 'Términos estándar de cotización');
      setEditingOrder(supplierId);
    },
    [orders]
  );

  const handleSaveTerms = useCallback(
    async (supplierId: number) => {
      setLoadingStates(prev => ({ ...prev, savingTerms: supplierId }));

      try {
        const existingOrder = orders[supplierId];
        // No modificar el orderNumber existente, solo actualizar términos
        const selectedArticlesToSend = Array.from(
          selectedArticles[supplierId] || []
        );
        const selectedServicesToSend = Array.from(
          selectedServices[supplierId] || []
        );

        const updateData: UpdateQuotationOrderDto = {
          supplierId,
          terms: editingTerms,
          selectedArticles: selectedArticlesToSend,
          selectedServices: selectedServicesToSend,
        };

        const result = await updateQuotationOrder(
          quotationRequestId,
          updateData
        );

        if (result) {
          setOrders(prev => ({
            ...prev,
            [supplierId]: {
              ...(existingOrder || {
                id: Date.now(),
                supplierId,
                requirementId: requirement.id,
                orderNumber: '',
                deadline: new Date(deadline),
                status: QuotationSupplierStatus.PENDING,
                createdAt: new Date(),
              }),
              terms: editingTerms,
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
            error ||
              'No se pudieron actualizar los términos. Inténtalo de nuevo.'
          );
        }
      } finally {
        setLoadingStates(prev => ({ ...prev, savingTerms: null }));
      }
    },
    [
      orders,
      selectedArticles,
      selectedServices,
      requirement.code,
      deadline,
      updateQuotationOrder,
      quotationRequestId,
      selectedSuppliers,
      showSuccess,
      showError,
      error,
    ]
  );

  const handleExportPDF = useCallback(
    async (supplierId: number) => {
      setLoadingStates(prev => ({ ...prev, exportingPdf: supplierId }));

      try {
        const blob = await quotationService.downloadPurchaseRequestPdf(
          quotationRequestId,
          supplierId
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `solicitud_compra_${quotationRequestId}_${supplierId}.pdf`;
        a.click();
        showSuccess(
          'PDF generado',
          `El PDF se ha generado correctamente para ${selectedSuppliers.find(s => s.supplier.id === supplierId)?.supplier.businessName}`
        );
      } catch (error) {
        showError('Error al generar PDF', (error as Error).message);
      } finally {
        setLoadingStates(prev => ({ ...prev, exportingPdf: null }));
      }
    },
    [quotationRequestId, selectedSuppliers, showSuccess, showError]
  );

  const handleSaveOrder = useCallback(
    async (supplierId: number) => {
      setLoadingStates(prev => ({ ...prev, savingOrder: supplierId }));

      try {
        const order = orders[supplierId];
        if (!order) return;

        const updateData: UpdateQuotationOrderDto = {
          supplierId,
          orderNumber: order.orderNumber,
          terms: order.terms,
          selectedArticles: Array.from(selectedArticles[supplierId] || []),
          selectedServices: Array.from(selectedServices[supplierId] || []),
        };

        const result = await updateQuotationOrder(
          quotationRequestId,
          updateData
        );

        if (result) {
          setOrders(prev => ({
            ...prev,
            [supplierId]: {
              ...prev[supplierId]!,
              status:
                result.quotationSuppliers.find(
                  qs => qs.supplier.id === supplierId
                )?.status || QuotationSupplierStatus.PENDING,
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
      } finally {
        setLoadingStates(prev => ({ ...prev, savingOrder: null }));
      }
    },
    [
      orders,
      selectedArticles,
      selectedServices,
      updateQuotationOrder,
      quotationRequestId,
      selectedSuppliers,
      showSuccess,
      showError,
      error,
    ]
  );

  const handleSendOrder = useCallback(
    async (supplierId: number) => {
      setLoadingStates(prev => ({ ...prev, sendingOrder: supplierId }));

      try {
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
      } finally {
        setLoadingStates(prev => ({ ...prev, sendingOrder: null }));
      }
    },
    [
      orders,
      sendQuotationOrder,
      quotationRequestId,
      selectedSuppliers,
      showSuccess,
      showError,
      error,
    ]
  );

  const handleSendAllOrders = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, sendingAllOrders: true }));

    try {
      const result = await sendAllQuotationOrders(quotationRequestId);

      if (result) {
        setOrders(prevOrders => {
          const updatedOrders: Record<number, QuotationOrder> = {};
          Object.keys(prevOrders).forEach(supplierId => {
            const supplierIdNum = parseInt(supplierId);
            updatedOrders[supplierIdNum] = {
              ...prevOrders[supplierIdNum],
              status: QuotationSupplierStatus.SENT,
            };
          });
          return updatedOrders;
        });

        showSuccess(
          'Órdenes enviadas',
          'Todas las órdenes se han enviado exitosamente'
        );
      } else {
        showError(
          'Error al enviar órdenes',
          error || 'No se pudieron enviar las órdenes. Inténtalo de nuevo.'
        );
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, sendingAllOrders: false }));
    }
  }, [
    sendAllQuotationOrders,
    quotationRequestId,
    showSuccess,
    showError,
    error,
  ]);

  const handleApplyGeneralTermsToAll = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, applyingGeneralTerms: true }));

    try {
      const result = await applyGeneralTermsToAll(quotationRequestId, {
        terms: generalTerms,
        deadline: new Date(deadline),
        selectedArticles:
          requirement.requirementArticles.map(ra => ({
            articleId: ra.id,
            quantity: ra.quantity,
          })) || [],
        selectedServices:
          requirement.requirementServices?.map(rs => ({
            serviceId: rs.service.id,
            duration: rs.duration || 0,
            durationType: rs.durationType || '',
          })) || [],
      });

      if (result) {
        const newOrders: Record<number, QuotationOrder> = {};
        const newSelectedArticles: Record<number, Set<number>> = {};
        const newSelectedServices: Record<number, Set<number>> = {};

        result.quotationSuppliers.forEach(quotationSupplier => {
          const supplierId = quotationSupplier.supplier.id;

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

          newSelectedArticles[supplierId] = new Set(
            quotationSupplier.quotationSupplierArticles.map(
              qsa => qsa.requirementArticle.id
            )
          );
          newSelectedServices[supplierId] = new Set(
            quotationSupplier.quotationSupplierServices.map(
              qss => qss.requirementService.id
            )
          );
        });

        setOrders(newOrders);
        setSelectedArticles(newSelectedArticles);
        setSelectedServices(newSelectedServices);

        showSuccess(
          'Términos aplicados',
          'Se han aplicado los términos generales y guardado todas las órdenes con todos los artículos y servicios seleccionados'
        );
      }
    } catch {
      showError(
        'Error al aplicar términos',
        'No se pudieron aplicar los términos generales a todas las órdenes'
      );
    } finally {
      setLoadingStates(prev => ({ ...prev, applyingGeneralTerms: false }));
    }
  }, [
    applyGeneralTermsToAll,
    quotationRequestId,
    generalTerms,
    deadline,
    requirement.requirementArticles,
    requirement.requirementServices,
    showSuccess,
    showError,
  ]);

  const handleProductToggle = useCallback(
    (supplierId: number, requirementArticleId: number) => {
      setSelectedArticles(prev => {
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
    },
    []
  );

  const handleSelectAllProducts = useCallback(
    (supplierId: number) => {
      const allRequirementArticleIds = new Set(
        requirement.requirementArticles.map(ra => ra.id)
      );
      setSelectedArticles(prev => ({
        ...prev,
        [supplierId]: allRequirementArticleIds,
      }));
    },
    [requirement.requirementArticles]
  );

  const handleDeselectAllProducts = useCallback((supplierId: number) => {
    setSelectedArticles(prev => ({
      ...prev,
      [supplierId]: new Set(),
    }));
  }, []);

  const handleServiceToggle = useCallback(
    (supplierId: number, requirementServiceId: number) => {
      setSelectedServices(prev => {
        const currentSelection = prev[supplierId] || new Set();
        const newSelection = new Set(currentSelection);

        if (newSelection.has(requirementServiceId)) {
          newSelection.delete(requirementServiceId);
        } else {
          newSelection.add(requirementServiceId);
        }

        return {
          ...prev,
          [supplierId]: newSelection,
        };
      });
    },
    []
  );

  const handleSelectAllServices = useCallback(
    (supplierId: number) => {
      if (
        requirement.requirementServices &&
        requirement.requirementServices.length > 0
      ) {
        const allRequirementServiceIds = new Set(
          requirement.requirementServices.map(rs => rs.id)
        );
        setSelectedServices(prev => ({
          ...prev,
          [supplierId]: allRequirementServiceIds,
        }));
      }
    },
    [requirement.requirementServices]
  );

  const handleDeselectAllServices = useCallback((supplierId: number) => {
    setSelectedServices(prev => ({
      ...prev,
      [supplierId]: new Set(),
    }));
  }, []);

  const handleContinue = useCallback(() => {
    const updatedSuppliers = selectedSuppliers.map(supplier => ({
      ...supplier,
      quotationOrder: orders[supplier.supplier.id],
    }));

    const sentOrdersCount = Object.values(orders).filter(
      o => o.status === QuotationSupplierStatus.SENT
    ).length;

    if (sentOrdersCount !== selectedSuppliers.length) {
      showError(
        'Error',
        'Debe enviar todas las órdenes para continuar con el proceso de cotización'
      );
      return;
    }

    onComplete(updatedSuppliers);
  }, [selectedSuppliers, orders, showError, onComplete]);

  // Funciones auxiliares memoizadas
  const getOrderStatus = useCallback(
    (supplierId: number) => {
      const order = orders[supplierId];
      if (!order) return 'PENDIENTE';
      return order.status === QuotationSupplierStatus.PENDING
        ? 'PENDIENTE'
        : order.status === QuotationSupplierStatus.SENT
          ? 'ENVIADA'
          : 'GUARDADA';
    },
    [orders]
  );

  const getSelectedArticlesCount = useCallback(
    (supplierId: number) => {
      return selectedArticles[supplierId]?.size || 0;
    },
    [selectedArticles]
  );

  const getSelectedServicesCount = useCallback(
    (supplierId: number) => {
      return selectedServices[supplierId]?.size || 0;
    },
    [selectedServices]
  );

  // Estadísticas memoizadas
  const statistics = useMemo(() => {
    const totalOrders = Object.keys(orders).length;
    const sentOrders = Object.values(orders).filter(
      o => o.status === QuotationSupplierStatus.SENT
    ).length;
    const pendingOrders = Object.values(orders).filter(
      o => o.status === QuotationSupplierStatus.PENDING
    ).length;
    const unsavedOrders = selectedSuppliers.length - totalOrders;

    return { totalOrders, sentOrders, pendingOrders, unsavedOrders };
  }, [orders, selectedSuppliers.length]);

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
                disabled={loadingStates.applyingGeneralTerms}
                className="text-sm bg-blue-500 text-white"
              >
                {loadingStates.applyingGeneralTerms
                  ? 'Aplicando...'
                  : 'Aplicar términos y crear órdenes'}
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
          const selectedArticlesCount = getSelectedArticlesCount(supplier.id);
          const selectedServicesCount = getSelectedServicesCount(supplier.id);
          const orderNumber = selectedSupplier.quotationOrder?.orderNumber;

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
                  <OrderStatusBadge status={status} />
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
                        onClick={() => handleSaveTerms(supplier.id)}
                        className="text-sm"
                        disabled={loadingStates.savingTerms === supplier.id}
                      >
                        {loadingStates.savingTerms === supplier.id ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingOrder(null)}
                        className="text-sm"
                        disabled={loadingStates.savingTerms === supplier.id}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <OrderPreview
                      order={order}
                      deadline={deadline}
                      selectedArticlesCount={selectedArticlesCount}
                      selectedServicesCount={selectedServicesCount}
                      totalArticles={totalArticles}
                      totalServices={
                        requirement.requirementServices?.length || 0
                      }
                      orderNumber={orderNumber}
                    />
                    {requirement.requirementArticles &&
                      requirement.requirementArticles.length > 0 && (
                        <ArticleSelection
                          supplierId={supplier.id}
                          requirementArticles={requirement.requirementArticles}
                          selectedArticles={
                            selectedArticles[supplier.id] || new Set()
                          }
                          onArticleToggle={handleProductToggle}
                          onSelectAll={handleSelectAllProducts}
                          onDeselectAll={handleDeselectAllProducts}
                        />
                      )}
                    {requirement.requirementServices &&
                      requirement.requirementServices.length > 0 && (
                        <ServiceSelection
                          supplierId={supplier.id}
                          requirementServices={requirement.requirementServices}
                          selectedServices={
                            selectedServices[supplier.id] || new Set()
                          }
                          onServiceToggle={handleServiceToggle}
                          onSelectAll={handleSelectAllServices}
                          onDeselectAll={handleDeselectAllServices}
                        />
                      )}

                    <ActionButtons
                      supplierId={supplier.id}
                      order={order}
                      selectedArticlesCount={selectedArticlesCount}
                      selectedServicesCount={selectedServicesCount}
                      loadingStates={loadingStates}
                      onEditTerms={handleEditTerms}
                      onExportPDF={handleExportPDF}
                      onSaveOrder={handleSaveOrder}
                      onSendOrder={handleSendOrder}
                    />
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
              {statistics.totalOrders}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Enviadas:</span>
            <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
              {statistics.sentOrders}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Guardadas:</span>
            <span className="ml-2 font-medium text-green-600 dark:text-green-400">
              {statistics.pendingOrders}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Sin guardar:
            </span>
            <span className="ml-2 font-medium text-yellow-600 dark:text-yellow-400">
              {statistics.unsavedOrders}
            </span>
          </div>
        </div>

        {/* Send All Orders Button */}
        <div className="flex justify-center">
          <Button
            variant={
              statistics.sentOrders === selectedSuppliers.length
                ? 'outline'
                : 'primary'
            }
            onClick={handleSendAllOrders}
            disabled={
              statistics.totalOrders === 0 ||
              loadingStates.sendingAllOrders ||
              statistics.sentOrders === selectedSuppliers.length
            }
            className="text-sm"
          >
            {loadingStates.sendingAllOrders
              ? 'Enviando...'
              : '📤 Enviar todas las órdenes'}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onBack}>← Volver</Button>
        <Button
          onClick={handleContinue}
          disabled={statistics.totalOrders === 0}
        >
          Continuar al siguiente paso
        </Button>
      </div>
    </div>
  );
};
