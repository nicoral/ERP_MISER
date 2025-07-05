import React, { useState, useEffect } from 'react';
import {
  type FinalSelectionItem,
  type FinalSelection as FinalSelectionType,
  type SelectedSupplier,
} from '../../../../types/quotation';
import { useQuotationService } from '../../../../hooks/useQuotationService';
import { useToast } from '../../../../contexts/ToastContext';
import { Button } from '../../../../components/common/Button';
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
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [showApprovalWarning, setShowApprovalWarning] = useState(false);
  const [finalSelectionData, setFinalSelectionData] =
    useState<FinalSelectionType | null>(null);

  const {
    getFinalSelectionByRequest,
    approveFinalSelection,
    updateFinalSelection,
  } = useQuotationService();
  const { showSuccess, showError } = useToast();

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

  // Cargar la selección final desde el backend
  useEffect(() => {
    const loadFinalSelection = async () => {
      try {
        const finalSelection =
          await getFinalSelectionByRequest(quotationRequestId);
        if (finalSelection) {
          setFinalSelectionData(finalSelection);
          setInternalNotes(finalSelection.notes || '');
        }
      } catch (error) {
        console.error('Error loading final selection:', error);
        showError('Error al cargar', 'No se pudo cargar la selección final');
      }
    };

    loadFinalSelection();
  }, [quotationRequestId, getFinalSelectionByRequest, showError]);

  const handleGeneratePurchaseOrder = async () => {
    setLoading(true);

    try {
      // Aquí iría la lógica para generar la orden de compra
      // Por ahora solo simulamos el proceso

      showSuccess(
        'Orden de compra generada',
        'Se ha generado la orden de compra exitosamente'
      );

      // Marcar como completado
      const updatedSuppliers = selectedSuppliers.map(supplier => ({
        ...supplier,
        isFinalSelected: true,
      }));

      onComplete(updatedSuppliers);
    } catch (error) {
      console.error('Error generating purchase order:', error);
      showError(
        'Error al generar orden de compra',
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
        setFinalSelectionData(approvedFinalSelection);
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
          Revisión y Generación de Orden de Compra
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Revisa la selección final completada y genera la orden de compra
        </p>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-green-500">✅</span>
          <span className="text-sm text-green-900 dark:text-green-100">
            Selección final completada exitosamente. Revisa los detalles a
            continuación.
          </span>
        </div>
      </div>

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
          {finalSelectionData.status === 'DRAFT' && (
            <Button
              onClick={handleShowApprovalWarning}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/20"
            >
              🚨 Aprobar Selección Final
            </Button>
          )}
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
                onClick={handleApproveWithNotes}
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
            Productos y proveedores seleccionados para la orden de compra
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
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {finalSelectionData.finalSelectionItems?.map(
                (item: FinalSelectionItem, index: number) => {
                  const requirementArticle =
                    requirement.requirementArticles.find(
                      ra => ra.id === item.requirementArticle.id
                    );
                  const supplier = selectedSuppliers.find(
                    s => s.supplier.id === item.supplier.id
                  );

                  return (
                    <tr key={index}>
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
                        <span className="font-medium">
                          {item.currency} {formatNumber(item.unitPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">
                          {item.currency} {formatNumber(item.totalPrice)}
                        </span>
                      </td>
                    </tr>
                  );
                }
              ) || (
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
            {finalSelectionData.finalSelectionItems
              ? new Set(
                  finalSelectionData.finalSelectionItems.map(
                    (item: FinalSelectionItem) => item.supplier.id
                  )
                ).size
              : 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Proveedores únicos
          </div>
        </div>

        {/* Selected Products */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Productos Seleccionados
          </h4>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {finalSelectionData.finalSelectionItems?.length || 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Productos únicos
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Total Estimado
          </h4>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {finalSelectionData.currency || 'PEN'}{' '}
            {formatNumber(
              finalSelectionData.finalSelectionItems?.reduce(
                (total: number, item: FinalSelectionItem) => {
                  return total + (+item.totalPrice || 0);
                },
                0
              ) || 0
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Monto total
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
            placeholder="Escribe tus observaciones aquí..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {internalNotes || 'No hay notas adicionales'}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {loading || finalSelectionData.status === 'APPROVED'
              ? 'La selección está aprobada. No se permiten cambios.'
              : ''}
          </div>
          <Button
            onClick={onBack}
            disabled={loading || finalSelectionData.status === 'APPROVED'}
          >
            ← Volver
          </Button>
        </div>
        <div className="text-right">
          <Button onClick={handleGeneratePurchaseOrder} disabled={loading}>
            {loading ? '🔄 Generando...' : '🛒 Generar Orden de Compra'}
          </Button>
        </div>
      </div>
    </div>
  );
};
