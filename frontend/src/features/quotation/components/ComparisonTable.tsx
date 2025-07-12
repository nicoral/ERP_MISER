import React, { useState } from 'react';
import { formatDate } from '../../../lib/utils';
import { formatCurrency } from '../../../utils/quotationUtils';
import {
  QuotationItemStatus,
  type SupplierQuotationItem,
  type SupplierQuotationServiceItem,
} from '../../../types/quotation';
import type { ComparisonTableProps } from '../types';
import quotationService from '../../../services/api/quotationService';
import { Button } from '../../../components/common/Button';
import { useCurrentExchangeRate } from '../../../hooks/useGeneralSettings';
import { useToast } from '../../../contexts/ToastContext';

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  quotation,
  selectedSupplierId,
  relevantSuppliers,
  selectedArticles,
  suppliersWithFinalSelection,
  finalSelection,
  signatures,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { data: exchangeRate } = useCurrentExchangeRate();
  const { showError, showSuccess } = useToast();

  const handleDownloadPdf = async () => {
    if (!selectedSupplierId) return;

    setIsDownloading(true);
    try {
      const blob = await quotationService.downloadQuotationComparisonPdf(
        quotation.id,
        selectedSupplierId
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const selectedSupplier = quotation.quotationSuppliers.find(
        qs => qs.supplier.id === selectedSupplierId
      );
      const supplierName =
        selectedSupplier?.supplier.businessName || 'proveedor';
      a.download = `cuadro_comparativo_${quotation.id}_${supplierName.replace(/\s+/g, '_')}.pdf`;
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

  // Mapear productos a filas y proveedores a columnas
  const getSupplierItem = (
    supplierId: number,
    articleId: number
  ): SupplierQuotationItem | undefined => {
    const qs = quotation.quotationSuppliers.find(
      qs => qs.supplier.id === supplierId
    );
    return qs?.supplierQuotation?.supplierQuotationItems.find(
      item => item.requirementArticle.article.id === articleId
    );
  };

  // Mapear servicios a filas y proveedores a columnas
  const getSupplierServiceItem = (
    supplierId: number,
    requirementServiceId: number
  ): SupplierQuotationServiceItem | undefined => {
    const qs = quotation.quotationSuppliers.find(
      qs => qs.supplier.id === supplierId
    );
    return qs?.supplierQuotation?.supplierQuotationServiceItems?.find(
      (item: SupplierQuotationServiceItem) =>
        item.requirementService.id === requirementServiceId
    );
  };

  // Obtener servicios seleccionados para el proveedor actual
  const getSelectedServices = () => {
    if (!quotation.finalSelection || !selectedSupplierId) return [];

    const selectedServiceIds =
      quotation.finalSelection.finalSelectionServiceItems
        .filter(item => item.supplier.id === selectedSupplierId)
        .map(item => item.requirementService.id);

    return (
      quotation.requirement.requirementServices
        ?.filter(reqService => selectedServiceIds.includes(reqService.id))
        .map(reqService => ({
          id: reqService.id,
          service: reqService.service,
          duration: reqService.duration,
          durationType: reqService.durationType,
          unitPrice: reqService.unitPrice,
        })) || []
    );
  };

  // Totales por proveedor (artículos + servicios)
  const getSupplierTotal = (supplierId: number): number => {
    if (!selectedSupplierId) return 0;

    // Obtener los artículos adjudicados al proveedor seleccionado
    const selectedArticles =
      quotation.finalSelection?.finalSelectionItems
        .filter(item => item.supplier.id === selectedSupplierId)
        .map(item => item.requirementArticle.article.id) || [];

    // Obtener los servicios adjudicados al proveedor seleccionado
    const selectedServices =
      quotation.finalSelection?.finalSelectionServiceItems
        .filter(item => item.supplier.id === selectedSupplierId)
        .map(item => item.requirementService.id) || [];

    if (selectedArticles.length === 0 && selectedServices.length === 0)
      return 0;

    const qs = quotation.quotationSuppliers.find(
      qs => qs.supplier.id === supplierId
    );

    if (!qs?.supplierQuotation) return 0;

    let total = 0;

    // Calcular total de artículos
    if (qs.supplierQuotation.supplierQuotationItems) {
      const articlesTotal = qs.supplierQuotation.supplierQuotationItems
        .filter(
          item =>
            selectedArticles.includes(item.requirementArticle.article.id) &&
            item.status === QuotationItemStatus.QUOTED
        )
        .reduce(
          (sum: number, item: SupplierQuotationItem) =>
            sum +
            (item.currency === 'PEN'
              ? +(item.totalPrice || 0)
              : +(item.totalPrice || 0) * (exchangeRate?.saleRate || 1)),
          0
        );
      total += articlesTotal;
    }

    // Calcular total de servicios
    if (qs.supplierQuotation.supplierQuotationServiceItems) {
      const servicesTotal = qs.supplierQuotation.supplierQuotationServiceItems
        .filter(
          (item: SupplierQuotationServiceItem) =>
            selectedServices.includes(item.requirementService.id) &&
            item.status === QuotationItemStatus.QUOTED
        )
        .reduce(
          (sum: number, item: SupplierQuotationServiceItem) =>
            sum +
            (item.currency === 'PEN'
              ? +(item.unitPrice || 0)
              : +(item.unitPrice || 0) * (exchangeRate?.saleRate || 1)),
          0
        );
      total += servicesTotal;
    }

    return total;
  };

  // Tiempos de entrega por proveedor
  const getSupplierDelivery = (supplierId: number): string => {
    const qs = quotation.quotationSuppliers.find(
      qs => qs.supplier.id === supplierId
    );
    const delivery =
      qs?.supplierQuotation?.supplierQuotationItems[0]?.deliveryTime;
    if (delivery === 0) return 'Inmediato';
    if (typeof delivery === 'number' && delivery > 0) return `${delivery} días`;
    return '-';
  };

  // Condiciones de pago por proveedor
  const getSupplierTerms = (supplierId: number): string => {
    const qs = quotation.quotationSuppliers.find(
      qs => qs.supplier.id === supplierId
    );
    return qs?.terms || '-';
  };

  // Observaciones por proveedor
  const getSupplierNotes = (supplierId: number): string => {
    const qs = quotation.quotationSuppliers.find(
      qs => qs.supplier.id === supplierId
    );
    return qs?.supplierQuotation?.notes || '-';
  };

  const isVisibleGerencia = (supplierId: number): boolean => {
    const total =
      quotation.finalSelection?.finalSelectionItems
        .filter(item => item.supplier.id === supplierId)
        .reduce((sum, item) => sum + (+item.totalPrice || 0), 0) || 0;

    const servicesTotal =
      quotation.finalSelection?.finalSelectionServiceItems
        .filter(item => item.supplier.id === supplierId)
        .reduce((sum, item) => sum + (+item.unitPrice || 0), 0) || 0;

    return total + servicesTotal >= 10000;
  };

  const selectedServices = getSelectedServices();

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
        <div className="flex justify-between items-center  p-4 ">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white"></h3>
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              {/* Segunda fila: "PROPUESTAS" unido */}
              <tr className="bg-gray-50 dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                <th
                  className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  colSpan={4}
                ></th>
                <th
                  className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  colSpan={relevantSuppliers.length}
                >
                  PROPUESTAS
                </th>
              </tr>
              {/* Fila de RAZÓN SOCIAL */}
              <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <td className="px-3 py-2" colSpan={3}></td>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  RAZÓN SOCIAL
                </th>
                {relevantSuppliers.map((s, idx) => (
                  <td
                    key={s.supplier.id}
                    className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                      s.supplier.id === selectedSupplierId
                        ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                        : ''
                    }`}
                  >
                    {s.supplier.businessName}
                  </td>
                ))}
              </tr>
              {/* Fila de RUC */}
              <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <td className="px-3 py-2" colSpan={3}></td>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  RUC
                </th>
                {relevantSuppliers.map((s, idx) => (
                  <td
                    key={s.supplier.id}
                    className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                      s.supplier.id === selectedSupplierId
                        ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                        : ''
                    }`}
                  >
                    {s.supplier.ruc}
                  </td>
                ))}
              </tr>
              {/* Fila de COTIZACIÓN N° */}
              <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <td className="px-3 py-2" colSpan={3}></td>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  COTIZACIÓN N°
                </th>
                {relevantSuppliers.map((s, idx) => (
                  <td
                    key={s.supplier.id}
                    className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                      s.supplier.id === selectedSupplierId
                        ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                        : ''
                    }`}
                  >
                    {s.supplierQuotation?.quotationNumber || '-'}
                  </td>
                ))}
              </tr>
              {/* Fila de FECHA */}
              <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <td className="px-3 py-2" colSpan={3}></td>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  FECHA
                </th>
                {relevantSuppliers.map((s, idx) => (
                  <td
                    key={s.supplier.id}
                    className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                      s.supplier.id === selectedSupplierId
                        ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                        : ''
                    }`}
                  >
                    {s.supplierQuotation?.receivedAt
                      ? formatDate(s.supplierQuotation.receivedAt.toString())
                      : '-'}
                  </td>
                ))}
              </tr>
              {/* Fila de CONTACTO */}
              <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <td className="px-3 py-2" colSpan={3}></td>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CONTACTO
                </th>
                {relevantSuppliers.map((s, idx) => (
                  <td
                    key={s.supplier.id}
                    className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                      s.supplier.id === selectedSupplierId
                        ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                        : ''
                    }`}
                  >
                    {s.supplier.email || '-'}
                  </td>
                ))}
              </tr>
              {/* Fila de UBICACIÓN */}
              <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <td className="px-3 py-2" colSpan={3}></td>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  UBICACIÓN
                </th>
                {relevantSuppliers.map((s, idx) => (
                  <td
                    key={s.supplier.id}
                    className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                      s.supplier.id === selectedSupplierId
                        ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                        : ''
                    }`}
                  >
                    {s.supplier.address || '-'}
                  </td>
                ))}
              </tr>
              {/* Fila de encabezados de productos */}
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  UND
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  CANT.
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  DESCRIPCIÓN
                </th>
                <th
                  className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  colSpan={relevantSuppliers.length}
                >
                  EVALUACIÓN
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* Artículos */}
              {selectedArticles.map((art, idx) => (
                <tr key={`article-${art.id}`}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                    {art.article.unitOfMeasure}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                    {art.quantity}
                  </td>
                  <td className="px-3 py-2 text-sm">{art.article.name}</td>
                  {relevantSuppliers.map((s, idx) => {
                    const item = getSupplierItem(s.supplier.id, art.article.id);
                    return (
                      <td
                        key={s.supplier.id}
                        className={`px-3 py-2 text-sm text-center align-top${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                          s.supplier.id === selectedSupplierId
                            ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                            : ''
                        }`}
                      >
                        {item ? (
                          <>
                            {item.status ===
                            QuotationItemStatus.NOT_AVAILABLE ? (
                              <span className="text-xs text-gray-400 col-span-1">
                                No disponible
                              </span>
                            ) : (
                              <>
                                <div className="grid grid-cols-2 gap-x-2">
                                  <span className="text-xs text-gray-400 col-span-1">
                                    Precio Unit
                                  </span>
                                  <span className="text-xs text-gray-400 col-span-1">
                                    Parcial
                                  </span>
                                  <span className="font-semibold col-span-1">
                                    {formatCurrency(
                                      item.unitPrice || 0,
                                      item.currency
                                    )}
                                  </span>
                                  <span className="font-semibold col-span-1">
                                    {formatCurrency(
                                      item.totalPrice || 0,
                                      item.currency
                                    )}
                                  </span>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-400 text-xs">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Servicios */}
              {selectedServices.map((service, idx) => (
                <tr key={`service-${service.id}`}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                    {selectedArticles.length + idx + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                    {service.durationType || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                    {service.duration || '-'}
                  </td>
                  <td className="px-3 py-2 text-sm">{service.service.name}</td>
                  {relevantSuppliers.map((s, idx) => {
                    const item = getSupplierServiceItem(
                      s.supplier.id,
                      service.id
                    );
                    return (
                      <td
                        key={s.supplier.id}
                        className={`px-3 py-2 text-sm text-center align-top${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                          s.supplier.id === selectedSupplierId
                            ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                            : ''
                        }`}
                      >
                        {item ? (
                          <>
                            {item.status ===
                            QuotationItemStatus.NOT_AVAILABLE ? (
                              <span className="text-xs text-gray-400 col-span-1">
                                No disponible
                              </span>
                            ) : (
                              <>
                                <div className="grid grid-cols-2 gap-x-2">
                                  <span className="text-xs text-gray-400 col-span-1">
                                    Precio Unit
                                  </span>
                                  <span className="text-xs text-gray-400 col-span-1">
                                    Total
                                  </span>
                                  <span className="font-semibold col-span-1">
                                    {formatCurrency(
                                      item.unitPrice || 0,
                                      item.currency
                                    )}
                                  </span>
                                  <span className="font-semibold col-span-1">
                                    {formatCurrency(
                                      item.unitPrice || 0,
                                      item.currency
                                    )}
                                  </span>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-400 text-xs">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Totales */}
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td className="px-3 py-2 text-right font-medium" colSpan={4}>
                  COSTO TOTAL
                </td>
                {relevantSuppliers.map((s, idx) => (
                  <td
                    key={s.supplier.id}
                    className={`px-3 py-2 text-center align-middle font-medium${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                      s.supplier.id === selectedSupplierId
                        ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                        : ''
                    }`}
                  >
                    {formatCurrency(getSupplierTotal(s.supplier.id), 'PEN')}
                  </td>
                ))}
              </tr>
              {/* Tiempo de entrega */}
              <tr className="bg-white dark:bg-gray-800">
                <td className="px-3 py-2 text-right" colSpan={4}>
                  TIEMPO DE ENTREGA
                </td>
                {relevantSuppliers.map((s, idx) => (
                  <td
                    key={s.supplier.id}
                    className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                      s.supplier.id === selectedSupplierId
                        ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                        : ''
                    }`}
                  >
                    {getSupplierDelivery(s.supplier.id)}
                  </td>
                ))}
              </tr>
              {/* Condiciones de pago */}
              <tr className="bg-white dark:bg-gray-800">
                <td className="px-3 py-2 text-right" colSpan={4}>
                  CONDICIONES DE PAGO
                </td>
                {relevantSuppliers.map((s, idx) => (
                  <td
                    key={s.supplier.id}
                    className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                      s.supplier.id === selectedSupplierId
                        ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                        : ''
                    }`}
                  >
                    {getSupplierTerms(s.supplier.id)}
                  </td>
                ))}
              </tr>
              {/* Observaciones */}
              <tr className="bg-white dark:bg-gray-800">
                <td className="px-3 py-2 text-right" colSpan={4}>
                  OBSERVACIONES
                </td>
                {relevantSuppliers.map((s, idx) => (
                  <td
                    key={s.supplier.id}
                    className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''} ${
                      s.supplier.id === selectedSupplierId
                        ? 'shadow-md ring-2 ring-blue-300 dark:ring-blue-600'
                        : ''
                    }`}
                  >
                    {getSupplierNotes(s.supplier.id)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Proveedor seleccionado */}
      <div className="mb-4">
        <div className="font-semibold text-xs mb-1">PROVEEDOR SELECCIONADO</div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                RUC
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                RAZÓN SOCIAL
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                DIRECCIÓN
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {(() => {
              const selectedSupplier = suppliersWithFinalSelection.find(
                s => s.id === selectedSupplierId
              );
              if (!selectedSupplier) {
                return (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-2 text-center text-sm text-gray-400"
                    >
                      Sin proveedor seleccionado
                    </td>
                  </tr>
                );
              }

              // Calcular total incluyendo artículos y servicios
              const articlesTotal =
                quotation.finalSelection?.finalSelectionItems
                  .filter(item => item.supplier.id === selectedSupplierId)
                  .reduce(
                    (sum, item) =>
                      sum +
                      (item.currency === 'PEN'
                        ? +item.totalPrice || 0
                        : (+item.totalPrice || 0) *
                          (exchangeRate?.saleRate || 1)),
                    0
                  ) || 0;

              const servicesTotal =
                quotation.finalSelection?.finalSelectionServiceItems
                  .filter(item => item.supplier.id === selectedSupplierId)
                  .reduce(
                    (sum, item) =>
                      sum +
                      (item.currency === 'PEN'
                        ? +item.unitPrice || 0
                        : (+item.unitPrice || 0) *
                          (exchangeRate?.saleRate || 1)),
                    0
                  ) || 0;

              const total = articlesTotal + servicesTotal;

              return (
                <tr>
                  <td className="px-3 py-2 text-sm">{selectedSupplier.ruc}</td>
                  <td className="px-3 py-2 text-sm">
                    {selectedSupplier.businessName}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {selectedSupplier.address || '-'}
                  </td>
                  <td className="px-3 py-2 text-center text-sm font-semibold">
                    {formatCurrency(total, 'PEN')}
                  </td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>

      {/* Conclusión final */}
      <div className="mb-4">
        <div className="font-semibold text-xs mb-1">
          CONCLUSION FINAL (RAZONES DE LA ADJUDICACION)
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-xs">
          {finalSelection?.notes || 'Sin conclusión registrada.'}
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
                  <div className="text-center">
                    <div className="text-xs text-green-600 dark:text-green-300 font-semibold">
                      Firmado
                    </div>
                    {firma.signedBy && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {firma.signedBy.firstName} {firma.signedBy.lastName}
                      </div>
                    )}
                    {firma.signedAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDate(firma.signedAt.toString())}
                      </div>
                    )}
                  </div>
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
