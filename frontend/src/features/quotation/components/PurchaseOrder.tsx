import React, { useState, useMemo } from 'react';
import { formatCurrency, formatDate } from '../../../utils/quotationUtils';
import type { PurchaseOrderProps } from '../types';
import { numberToSpanishWordsCurrency } from '../../../utils/helpers';
import { FormInput } from '../../../components/common/FormInput';
import {
  useCurrentExchangeRate,
  useGeneralTax,
} from '../../../hooks/useGeneralSettings';
import { useQuotationService } from '../../../hooks/useQuotationService';
import { Button } from '../../../components/common/Button';
import quotationService from '../../../services/api/quotationService';

export const PurchaseOrder: React.FC<PurchaseOrderProps> = ({
  quotation,
  selectedSupplierId,
  selectedArticles,
  signatures,
}) => {
  const supplierSelected = quotation.quotationSuppliers.find(
    qs => qs.supplier.id === selectedSupplierId
  );
  const { data: exchangeRate } = useCurrentExchangeRate();

  const { data: generalTax } = useGeneralTax();
  // Estado local para forma de pago
  const igvPercentage = supplierSelected?.supplierQuotation?.igv
    ? Number(supplierSelected?.supplierQuotation?.igv)
    : generalTax || 18;

  const [paymentMethod, setPaymentMethod] = useState(
    supplierSelected?.supplierQuotation?.methodOfPayment || ''
  );

  // Estado para el botón de descarga
  const [isDownloading, setIsDownloading] = useState(false);

  // Calcular fecha de entrega basada en el tiempo de entrega del proveedor
  const deliveryDate = useMemo(() => {
    if (!selectedSupplierId) return 'POR DEFINIR';

    const qs = quotation.quotationSuppliers.find(
      qs => qs.supplier.id === selectedSupplierId
    );

    const deliveryTime =
      qs?.supplierQuotation?.supplierQuotationItems[0]?.deliveryTime;

    if (deliveryTime === undefined || deliveryTime === null)
      return 'POR DEFINIR';
    if (deliveryTime === 0) return 'Inmediato';

    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + deliveryTime);

    return deliveryDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }, [selectedSupplierId, quotation.quotationSuppliers]);

  // Calcular total, subtotal y IGV con el porcentaje personalizable
  const total = selectedArticles.reduce((sum, art) => {
    const finalSelectionItem =
      quotation.finalSelection?.finalSelectionItems.find(
        item =>
          item.requirementArticle.id === art.id &&
          item.supplier.id === selectedSupplierId
      );
    return (
      sum +
      (finalSelectionItem?.currency === 'PEN'
        ? Number(finalSelectionItem?.totalPrice || 0)
        : Number(finalSelectionItem?.totalPrice || 0) *
          (exchangeRate?.saleRate || 1))
    );
  }, 0);
  const subtotal = +(total / (1 + igvPercentage / 100)).toFixed(2);
  const igv = +(total - subtotal).toFixed(2);
  const currency =
    quotation.finalSelection?.finalSelectionItems.find(
      item => item.supplier.id === selectedSupplierId
    )?.currency || 'PEN';
  const {
    updateSupplierQuotationOc,
    loading: loadingUpdateSupplierQuotationOc,
  } = useQuotationService();

  const handleUpdateSupplierQuotation = () => {
    if (!supplierSelected?.supplierQuotation?.id) return;
    try {
      updateSupplierQuotationOc(supplierSelected?.supplierQuotation?.id || 0, {
        methodOfPayment: paymentMethod,
        igv: igvPercentage.toString(),
      });
      supplierSelected.supplierQuotation.methodOfPayment = paymentMethod;
      supplierSelected.supplierQuotation.igv = igvPercentage.toString();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedSupplierId) return;

    setIsDownloading(true);
    try {
      const blob = await quotationService.downloadPurchaseOrderPdf(
        quotation.id,
        selectedSupplierId
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orden-compra-${quotation.code}-${selectedSupplierId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      alert('Error al descargar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const isVisibleGerencia = (supplierId: number): boolean => {
    const total =
      quotation.finalSelection?.finalSelectionItems
        .filter(item => item.supplier.id === supplierId)
        .reduce((sum, item) => sum + (+item.totalPrice || 0), 0) || 0;
    return total >= 10000;
  };

  return (
    <>
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Orden de Compra -{' '}
              {supplierSelected?.supplierQuotation?.quotationNumber ||
                'Proveedor'}
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
                  <span className="font-medium">Nombre:</span> MYSER S.A.C.
                </div>
                <div>
                  <span className="font-medium">RUC:</span> 20123456789
                </div>
                <div>
                  <span className="font-medium">Domicilio:</span> Av. Principal
                  123
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span> (01) 123-4567
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
                  {supplierSelected?.supplier.businessName || 'POR DEFINIR'}
                </div>
                <div>
                  <span className="font-medium">RUC:</span>{' '}
                  {supplierSelected?.supplier.ruc || 'POR DEFINIR'}
                </div>
                <div>
                  <span className="font-medium">Domicilio:</span>{' '}
                  {supplierSelected?.supplier.address || 'POR DEFINIR'}
                </div>
                <div>
                  <span className="font-medium">Teléfono:</span>{' '}
                  {supplierSelected?.supplier.mobile || 'POR DEFINIR'}
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
                  {selectedArticles.map((art, idx) => {
                    const finalSelectionItem =
                      quotation.finalSelection?.finalSelectionItems.find(
                        item =>
                          item.requirementArticle.id === art.id &&
                          item.supplier.id === selectedSupplierId
                      );
                    return (
                      <tr key={art.id}>
                        <td className="px-4 py-2 text-sm">{idx + 1}</td>
                        <td className="px-4 py-2 text-sm">
                          {art.article.code}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {art.article.name}
                        </td>
                        <td className="px-4 py-2 text-sm">{art.quantity}</td>
                        <td className="px-4 py-2 text-sm">
                          {formatCurrency(
                            finalSelectionItem?.unitPrice || 0,
                            finalSelectionItem?.currency
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {formatCurrency(
                            finalSelectionItem?.totalPrice || 0,
                            finalSelectionItem?.currency
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Condiciones y cálculos de impuestos alineados como en el PDF */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-8">
              {/* Condiciones de compra alineadas a la izquierda */}
              <div className="flex flex-col text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Forma de Pago:</span>
                  {supplierSelected?.supplierQuotation?.methodOfPayment ? (
                    <span>{paymentMethod}</span>
                  ) : (
                    <>
                      <FormInput
                        type="text"
                        className="border border-gray-300 rounded px-2 py-1 text-sm w-56"
                        value={paymentMethod}
                        onChange={e =>
                          setPaymentMethod(e.target.value.toUpperCase())
                        }
                      />
                      <Button
                        onClick={handleUpdateSupplierQuotation}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        disabled={loadingUpdateSupplierQuotationOc}
                      >
                        Actualizar
                      </Button>
                    </>
                  )}
                </div>
                <div>
                  <span className="font-bold">Fecha Entrega:</span>{' '}
                  <span>{deliveryDate}</span>
                </div>
              </div>
              {/* Cálculos de impuestos alineados a la derecha */}
              <div>
                <table className="text-sm">
                  <tbody>
                    {currency !== 'PEN' && (
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
                        {formatCurrency(subtotal, 'PEN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-semibold pr-2 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          {`IGV ${igvPercentage}%`}
                        </div>
                      </td>
                      <td className="text-right">
                        {formatCurrency(igv, 'PEN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-bold pr-2 text-right">
                        Total Documento
                      </td>
                      <td className="text-right font-bold">
                        {formatCurrency(total, 'PEN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-start mt-8">
              <span className="text-sm font-bold">
                SON: {numberToSpanishWordsCurrency(total, 'PEN')}
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
              )
                return false;
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
