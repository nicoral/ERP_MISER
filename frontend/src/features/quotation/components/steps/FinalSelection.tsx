import React, { useState, useEffect } from 'react';
import {
  type FinalSelectionItem,
  type FinalSelectionServiceItem,
  type SelectedSupplier,
  type QuotationRequest,
  QuotationItemStatus,
} from '../../../../types/quotation';
import { useQuotationService } from '../../../../hooks/useQuotationService';
import { useToast } from '../../../../contexts/ToastContext';
import { Button } from '../../../../components/common/Button';
import type { Requirement } from '../../../../types/requirement';
import { useCurrentExchangeRate } from '../../../../hooks/useGeneralSettings';

interface FinalSelectionProps {
  requirement: Requirement;
  quotationRequest: QuotationRequest;
  onComplete: (selectedSuppliers: SelectedSupplier[]) => void;
  onBack: () => void;
}

export const FinalSelection: React.FC<FinalSelectionProps> = ({
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

  const [internalNotes, setInternalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [showApprovalWarning, setShowApprovalWarning] = useState(false);

  const { approveFinalSelection, updateFinalSelection } = useQuotationService();
  const { showSuccess, showError } = useToast();
  const { data: exchangeRate } = useCurrentExchangeRate();

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

  // Helper function to safely format numbers
  const formatNumber = (
    value: number | undefined | null | string,
    decimals: number = 2
  ): string => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(decimals);
    }
    if (typeof value === 'string' && !isNaN(Number(value))) {
      return Number(value).toFixed(decimals);
    }
    return '0.00';
  };

  // Usar los datos de selección final disponibles
  const finalSelectionData = quotationRequest.finalSelection;
  // Inicializar notas cuando se cargan los datos
  useEffect(() => {
    if (finalSelectionData?.notes && !internalNotes) {
      setInternalNotes(finalSelectionData.notes);
    }
  }, [finalSelectionData?.notes, internalNotes]);

  const handleGeneratePurchaseOrder = async () => {
    if (!finalSelectionData) return;

    setLoading(true);

    try {
      if (finalSelectionData.status === 'DRAFT') {
        await handleApproveWithNotes();
      }
      // Marcar como completado
      const updatedSuppliers = selectedSuppliers.map(supplier => ({
        ...supplier,
        isFinalSelected: true,
      }));

      onComplete(updatedSuppliers);
    } catch (error) {
      console.error('Error generating purchase orders:', error);
      showError(
        'Error al generar órdenes de compra',
        'Ocurrió un error inesperado. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowApprovalWarning = () => {
    setShowApprovalWarning(true);
  };

  const handleCancelApproval = () => {
    setShowApprovalWarning(false);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalNotes(e.target.value.toUpperCase());
  };

  // Función para manejar la aprobación con notas
  const handleApproveWithNotes = async () => {
    if (!finalSelectionData) return;

    setApproving(true);
    try {
      // Primero guardar las notas si han cambiado
      if (internalNotes.trim() !== (finalSelectionData.notes || '')) {
        const updatedNotes = internalNotes.toUpperCase();
        await updateFinalSelection(finalSelectionData.id, {
          notes: updatedNotes,
        });
        setInternalNotes(updatedNotes);
      }

      // Luego aprobar la selección final
      const approvedFinalSelection = await approveFinalSelection(
        finalSelectionData.id
      );

      if (approvedFinalSelection) {
        showSuccess(
          'Selección final aprobada',
          'La selección final ha sido aprobada exitosamente con las notas guardadas.'
        );
        setShowApprovalWarning(false);
      }
    } catch (error) {
      console.error('Error approving final selection:', error);
      showError(
        'Error al aprobar',
        'Ocurrió un error al aprobar la selección final. Inténtalo de nuevo.'
      );
    } finally {
      setApproving(false);
    }
  };

  // Si no hay datos de selección final, mostrar mensaje
  if (!finalSelectionData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              No hay selección final
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-4">
              No se encontró una selección final para esta cotización.
            </p>
            <Button onClick={onBack}>← Volver</Button>
          </div>
        </div>
      </div>
    );
  }

  // Calcular totales con conversión de moneda
  const totalArticles =
    finalSelectionData.finalSelectionItems?.reduce(
      (total: number, item: FinalSelectionItem) => {
        const priceInPEN = convertToPEN(
          Number(item.totalPrice) || 0,
          item.currency || 'PEN'
        );
        return total + priceInPEN;
      },
      0
    ) || 0;

  const totalServices =
    finalSelectionData.finalSelectionServiceItems?.reduce(
      (total: number, item: FinalSelectionServiceItem) => {
        const priceInPEN = convertToPEN(
          Number(item.unitPrice) || 0,
          item.currency || 'PEN'
        );
        return total + priceInPEN;
      },
      0
    ) || 0;

  const totalAmount = totalArticles + totalServices;

  // Calcular totales por moneda para mostrar
  const totalsByCurrency = {
    PEN: 0,
    USD: 0,
  };

  // Sumar artículos por moneda
  finalSelectionData.finalSelectionItems?.forEach(
    (item: FinalSelectionItem) => {
      const currency = item.currency || 'PEN';
      const amount = Number(item.totalPrice) || 0;
      if (currency === 'PEN' || currency === 'USD') {
        totalsByCurrency[currency] += amount;
      }
    }
  );

  // Sumar servicios por moneda
  finalSelectionData.finalSelectionServiceItems?.forEach(
    (item: FinalSelectionServiceItem) => {
      const currency = item.currency || 'PEN';
      const amount = Number(item.unitPrice) || 0;
      if (currency === 'PEN' || currency === 'USD') {
        totalsByCurrency[currency] += amount;
      }
    }
  );

  // Contar proveedores únicos
  const uniqueSuppliers = new Set([
    ...(finalSelectionData.finalSelectionItems?.map(
      item => item.supplier?.id
    ) || []),
    ...(finalSelectionData.finalSelectionServiceItems?.map(
      item => item.supplier?.id
    ) || []),
  ]);

  // Contar items únicos
  const totalItems =
    (finalSelectionData.finalSelectionItems?.length || 0) +
    (finalSelectionData.finalSelectionServiceItems?.length || 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Revisión de Proveedores Seleccionados
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Revisa la selección final completada y confirma el cuadro comparativo
        </p>
      </div>

      {/* Success Message */}
      {finalSelectionData.status === 'APPROVED' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✅</span>
            <span className="text-sm text-green-900 dark:text-green-100">
              Selección final completada exitosamente. Revisa los detalles a
              continuación.
            </span>
          </div>
        </div>
      )}

      {/* Status and Approval Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              Estado de la Selección Final
            </h4>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  finalSelectionData.status === 'APPROVED'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}
              >
                {finalSelectionData.status === 'APPROVED'
                  ? 'Aprobada'
                  : 'Borrador'}
              </span>
              {finalSelectionData.status === 'APPROVED' && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  No se permiten ediciones
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Warning Modal */}
      {showApprovalWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-orange-500 text-2xl">⚠️</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirmar Aprobación
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <strong>¡Atención!</strong> Una vez aprobada la selección final,
              no se permitirán más ediciones. Esta acción es irreversible.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas aprobar esta selección final?
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={handleCancelApproval}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGeneratePurchaseOrder}
                disabled={approving}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {approving ? '🔄 Aprobando...' : 'Sí, Aprobar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Final Selection Summary */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Resumen de Selección Final
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Productos, servicios y proveedores seleccionados para la orden de
            compra
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item
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
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* Artículos */}
              {finalSelectionData.finalSelectionItems
                ?.map((item: FinalSelectionItem, index: number) => {
                  // Validar que item tenga las propiedades necesarias
                  if (!item || !item.requirementArticle || !item.supplier) {
                    return null;
                  }

                  const requirementArticle =
                    requirement.requirementArticles.find(
                      ra => ra.id === item.requirementArticle?.id
                    );
                  const supplier = selectedSuppliers.find(
                    s => s.supplier.id === item.supplier?.id
                  );

                  return (
                    <tr key={`article-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {requirementArticle?.article.name ||
                              'Producto no encontrado'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {requirementArticle?.article.code || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {requirementArticle?.quantity || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {supplier?.supplier.businessName ||
                          'Proveedor no encontrado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <span className="font-medium">
                            {item.currency} {formatNumber(item.unitPrice)}
                          </span>
                          {item.currency !== 'PEN' && (
                            <div className="text-xs text-blue-500">
                              {getConvertedPriceDisplay(
                                Number(item.unitPrice) || 0,
                                item.currency
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <span className="font-medium">
                            {item.currency} {formatNumber(item.totalPrice)}
                          </span>
                          {item.currency !== 'PEN' && (
                            <div className="text-xs text-blue-500">
                              {getConvertedPriceDisplay(
                                Number(item.totalPrice) || 0,
                                item.currency
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
                .filter(Boolean) || []}

              {/* Servicios */}
              {finalSelectionData.finalSelectionServiceItems
                ?.map((item: FinalSelectionServiceItem, index: number) => {
                  // Validar que item tenga las propiedades necesarias
                  if (!item || !item.requirementService || !item.supplier) {
                    return null;
                  }

                  const requirementService =
                    requirement.requirementServices?.find(
                      rs => rs.id === item.requirementService?.id
                    );
                  const supplier = selectedSuppliers.find(
                    s => s.supplier.id === item.supplier?.id
                  );

                  return (
                    <tr key={`service-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {requirementService?.service.name ||
                              'Servicio no encontrado'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {requirementService?.service.code || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {requirementService?.duration || '-'}
                        {requirementService?.durationType && (
                          <span className="text-xs text-gray-500 ml-1">
                            {requirementService.durationType}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {supplier?.supplier.businessName ||
                          'Proveedor no encontrado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <span className="font-medium">
                            {item.currency} {formatNumber(item.unitPrice)}
                          </span>
                          {item.currency !== 'PEN' && (
                            <div className="text-xs text-blue-500">
                              {getConvertedPriceDisplay(
                                Number(item.unitPrice) || 0,
                                item.currency
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>
                          <span className="font-medium">
                            {item.currency} {formatNumber(item.unitPrice)}
                          </span>
                          {item.currency !== 'PEN' && (
                            <div className="text-xs text-blue-500">
                              {getConvertedPriceDisplay(
                                Number(item.unitPrice) || 0,
                                item.currency
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
                .filter(Boolean) || []}

              {/* Mensaje si no hay items */}
              {!finalSelectionData.finalSelectionItems?.length &&
                !finalSelectionData.finalSelectionServiceItems?.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No hay items en la selección final
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Selected Suppliers */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Proveedores Seleccionados
          </h4>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {uniqueSuppliers.size}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Proveedores únicos
          </div>
        </div>

        {/* Selected Items */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Items Seleccionados
          </h4>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalItems}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Artículos y servicios únicos
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Total Estimado
          </h4>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            PEN {formatNumber(totalAmount)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {totalsByCurrency.PEN > 0 && (
              <div>PEN {formatNumber(totalsByCurrency.PEN)}</div>
            )}
            {totalsByCurrency.USD > 0 && (
              <div>USD {formatNumber(totalsByCurrency.USD)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Notas de la Selección
        </h4>

        {finalSelectionData.status === 'DRAFT' ? (
          <input
            type="text"
            value={internalNotes}
            onChange={handleNotesChange}
            placeholder="Ingresa notas internas sobre la selección final..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {internalNotes || 'Sin notas'}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button onClick={onBack}>← Volver</Button>
        <Button
          onClick={handleShowApprovalWarning} //{handleGeneratePurchaseOrder}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? '🔄 Generando...' : '✅ Completar Proceso'}
        </Button>
      </div>
    </div>
  );
};
