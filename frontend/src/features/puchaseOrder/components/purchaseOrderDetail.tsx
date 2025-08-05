import { useState } from 'react';
import { formatCurrency } from '../../../utils/quotationUtils';
import type { PurchaseOrderItem } from '../../../types/purchaseOrder';
import { numberToSpanishWordsCurrency } from '../../../utils/helpers';
import { useCurrentExchangeRate } from '../../../hooks/useGeneralSettings';
import { Button } from '../../../components/common/Button';
import { useToast } from '../../../contexts/ToastContext';
import {
  usePurchaseOrderByIdQuery,
  usePurchaseOrderSignatureConfiguration,
} from '../../../hooks/usePurchaseOrderService';
import { usePurchaseOrderService } from '../../../hooks/usePurchaseOrderService';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const PurchaseOrder = () => {
  const params = useParams();
  const { showError, showSuccess } = useToast();
  const { data: exchangeRate } = useCurrentExchangeRate();
  const { downloadPurchaseOrderPdf } = usePurchaseOrderService();
  const { data: purchaseOrder, isLoading: loading } = usePurchaseOrderByIdQuery(
    Number(params.id)
  );

  // Hook para la configuración de firmas
  const { data: signatureConfig, isLoading: loadingSignatureConfig } =
    usePurchaseOrderSignatureConfiguration(
      params.id ? Number(params.id) : undefined
    );

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!purchaseOrder) return;
    setIsDownloading(true);
    try {
      const blob = await downloadPurchaseOrderPdf(purchaseOrder.id);
      if (!blob) {
        throw new Error('No se pudo obtener el PDF');
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orden-compra-${purchaseOrder.code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('PDF descargado correctamente');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error desconocido al descargar el PDF';
      showError('Error al descargar el PDF', errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin" />
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

  if (!purchaseOrder) return null;
  return (
    <>
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Orden de{' '}
              {purchaseOrder.requirement?.type === 'ARTICLE'
                ? 'Compra'
                : 'Servicio'}{' '}
              - {purchaseOrder.code}
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
                        <td className="px-4 py-2 text-sm">{item.quantity}</td>
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
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Firmas</h3>
        {loadingSignatureConfig ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando firmas...</span>
          </div>
        ) : null}

        {signatureConfig ? (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${
              signatureConfig.configurations.filter(config => config.isRequired)
                .length
            } gap-4`}
          >
            {signatureConfig.configurations
              .filter(config => config.isRequired)
              .map(config => {
                const getSignatureDate = (level: number) => {
                  switch (level) {
                    case 1:
                      return purchaseOrder?.firstSignedAt;
                    case 2:
                      return purchaseOrder?.secondSignedAt;
                    case 3:
                      return purchaseOrder?.thirdSignedAt;
                    case 4:
                      return purchaseOrder?.fourthSignedAt;
                    default:
                      return null;
                  }
                };

                const getSignatureLabel = (roleName: string) => {
                  switch (roleName) {
                    case 'SOLICITANTE':
                      return 'Solicitante';
                    case 'OFICINA_TECNICA':
                      return 'Oficina Técnica';
                    case 'ADMINISTRACION':
                      return 'Administración';
                    case 'GERENCIA':
                      return 'Gerencia';
                    default:
                      return roleName;
                  }
                };

                const signatureDate = getSignatureDate(config.signatureLevel);
                const signatureLabel = getSignatureLabel(config.roleName);

                return (
                  <div
                    key={config.id}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded shadow"
                  >
                    <div className="font-medium text-sm mb-1">
                      {signatureLabel}
                    </div>
                    {signatureDate ? (
                      <div className="text-xs text-green-600 dark:text-green-300 font-semibold">
                        {new Date(signatureDate).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        Pendiente
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No se pudo cargar la configuración de firmas
          </div>
        )}
      </div>
    </>
  );
};
