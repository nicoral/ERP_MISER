import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../../utils/quotationUtils';
import type { PurchaseOrderProps } from '../types';
import type { PurchaseOrderItem } from '../../../types/purchaseOrder';
import { numberToSpanishWordsCurrency } from '../../../utils/helpers';
import { useCurrentExchangeRate } from '../../../hooks/useGeneralSettings';
import { Button } from '../../../components/common/Button';
import { FormInput } from '../../../components/common/FormInput';
import { useToast } from '../../../contexts/ToastContext';
import { usePurchaseOrderQuery } from '../../../hooks/usePurchaseOrderService';
import { usePurchaseOrderService } from '../../../hooks/usePurchaseOrderService';
import { useQueryClient } from '@tanstack/react-query';

export const PurchaseOrder: React.FC<PurchaseOrderProps> = ({
  quotation,
  selectedSupplierId,
  signatures,
  onGeneratePurchaseOrder,
  isGenerating,
}) => {
  const { showError, showSuccess } = useToast();
  const { data: exchangeRate } = useCurrentExchangeRate();
  const queryClient = useQueryClient();
  const { downloadPurchaseOrderPdf } = usePurchaseOrderService();
  const {
    data: purchaseOrder,
    isLoading: loading,
    refetch,
  } = usePurchaseOrderQuery(
    quotation?.id ?? undefined,
    selectedSupplierId ?? undefined
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

  // Al generar la orden, invalidar la query para refrescar el cache
  const handleGenerateOrder = async (payment: string) => {
    if (onGeneratePurchaseOrder) {
      await onGeneratePurchaseOrder(payment);
      await queryClient.invalidateQueries({
        queryKey: [
          'purchaseOrder',
          quotation?.id ?? undefined,
          selectedSupplierId ?? undefined,
        ],
      });
      refetch();
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedSupplierId || !purchaseOrder) return;
    setIsDownloading(true);
    try {
      const blob = await downloadPurchaseOrderPdf(purchaseOrder.id);
      if (!blob) {
        throw new Error('No se pudo obtener el PDF');
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orden-compra-${quotation.code}-${selectedSupplierId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('PDF descargado correctamente');
    } catch (error) {
      showError('Error al descargar el PDF', error as string);
    } finally {
      setIsDownloading(false);
    }
  };

  const isVisibleGerencia = (supplierId: number): boolean => {
    const total =
      quotation.finalSelection?.finalSelectionItems
        .filter(item => item.supplier.id === supplierId)
        .reduce((sum: number, item) => sum + (+item.totalPrice || 0), 0) || 0;
    return total >= 10000;
  };

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Cargando orden de compra...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Por favor espera mientras se cargan los datos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si no existe la orden de compra, mostrar botón para generar
  if (!purchaseOrder) {
    return (
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se ha generado la orden de compra
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Para este proveedor aún no se ha generado la orden de compra.
            </p>
            {/* Campo de forma de pago */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Forma de Pago *
              </label>
              <FormInput
                type="text"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value.toUpperCase())}
                placeholder="Ej: CONTADO, CRÉDITO 30 DÍAS, etc."
                className="w-full max-w-md mx-auto"
                required
              />
            </div>
            <Button
              onClick={() => handleGenerateOrder(paymentMethod)}
              disabled={isGenerating || !paymentMethod.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generando...
                </span>
              ) : (
                '🛒 Generar Orden de Compra'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Orden de Compra - {purchaseOrder.code}
            </h3>
            <Button
              onClick={handleDownloadPdf}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generando PDF...
                </>
              ) : (
                '📄 Descargar PDF'
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Datos del Comprador
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Nombre:</span>{' '}
                  {purchaseOrder.buyerName}
                </div>
                <div>
                  <span className="font-medium">RUC:</span>{' '}
                  {purchaseOrder.buyerRUC}
                </div>
                <div>
                  <span className="font-medium">Domicilio:</span>{' '}
                  {purchaseOrder.buyerAddress}
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span>{' '}
                  {purchaseOrder.buyerPhone || '-'}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Datos del Proveedor
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Nombre:</span>{' '}
                  {purchaseOrder.supplierName}
                </div>
                <div>
                  <span className="font-medium">RUC:</span>{' '}
                  {purchaseOrder.supplierRUC}
                </div>
                <div>
                  <span className="font-medium">Domicilio:</span>{' '}
                  {purchaseOrder.supplierAddress}
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span>{' '}
                  {purchaseOrder.supplierPhone || '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Artículos Seleccionados
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Item
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Código
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Descripción
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {purchaseOrder.items.map(
                    (item: PurchaseOrderItem, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm">{item.item}</td>
                        <td className="px-4 py-2 text-sm">{item.code}</td>
                        <td className="px-4 py-2 text-sm">
                          {item.description}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {item.type === 'SERVICE'
                            ? item.duration + ' ' + item.durationType
                            : item.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {formatCurrency(
                            Number(item.unitPrice),
                            item.currency
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {formatCurrency(Number(item.amount), item.currency)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
            {/* Condiciones y cálculos de impuestos alineados como en el PDF */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-8">
              {/* Condiciones de compra alineadas a la izquierda */}
              <div className="flex flex-col text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Forma de Pago:</span>
                  <span>{purchaseOrder.paymentMethod || '-'}</span>
                </div>
                <div>
                  <span className="font-bold">Fecha Entrega:</span>{' '}
                  <span>{purchaseOrder.deliveryDate}</span>
                </div>
                <div>
                  <span className="font-bold">Retención:</span>{' '}
                  <span>
                    {purchaseOrder.supplier.appliesWithholding &&
                    purchaseOrder.total >= 700
                      ? `Si aplica retención del 3% (${formatCurrency(
                          purchaseOrder.total * 0.03,
                          purchaseOrder.currency
                        )})`
                      : 'No aplica retención'}
                  </span>
                </div>
              </div>
              {/* Cálculos de impuestos alineados a la derecha */}
              <div>
                <table className="text-sm">
                  <tbody>
                    {purchaseOrder.currency !== 'PEN' && (
                      <tr>
                        <td className="font-semibold pr-2 text-right">
                          Tipo de Cambio
                        </td>
                        <td className="text-right">
                          {formatCurrency(exchangeRate?.saleRate || 1, 'PEN')}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="font-semibold pr-2 text-right">
                        Sub Total
                      </td>
                      <td className="text-right">
                        {formatCurrency(
                          purchaseOrder.subtotal,
                          purchaseOrder.currency
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold pr-2 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {`IGV ${purchaseOrder.igv ? (+purchaseOrder.igv).toFixed(0) : 18}%`}
                        </div>
                      </td>
                      <td className="text-right">
                        {formatCurrency(
                          purchaseOrder.total - purchaseOrder.subtotal,
                          purchaseOrder.currency
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold pr-2 text-right">
                        Total Documento
                      </td>
                      <td className="text-right font-bold">
                        {formatCurrency(
                          purchaseOrder.total,
                          purchaseOrder.currency
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-start mt-8">
              <span className="text-sm font-bold">
                SON:{' '}
                {numberToSpanishWordsCurrency(
                  +purchaseOrder.total,
                  purchaseOrder.currency as 'USD' | 'PEN'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Firmas */}
      <div className="mb-4">
        <div className="font-semibold text-xs mb-1">FIRMAS</div>
        <div
          className={`grid grid-cols-2 md:grid-cols-${
            isVisibleGerencia(selectedSupplierId || 0) ? 4 : 3
          } gap-4`}
        >
          {signatures
            .filter(s => {
              if (
                !isVisibleGerencia(selectedSupplierId || 0) &&
                s.label === 'Gerencia'
              ) {
                return false;
              }
              return true;
            })
            .map((firma, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded shadow"
              >
                <div className="font-medium text-sm mb-1">{firma.label}</div>
                {firma.signed ? (
                  <>
                    <div className="text-xs text-green-600 dark:text-green-300 font-semibold">
                      Firmado
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {firma.signedAt
                        ? formatDate(firma.signedAt.toString())
                        : ''}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400 italic">Pendiente</div>
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  );
};
