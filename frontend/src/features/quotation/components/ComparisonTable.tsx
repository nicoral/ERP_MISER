import React from 'react';
import { formatDate } from '../../../lib/utils';
import { formatCurrency } from '../../../utils/quotationUtils';
import {
  QuotationItemStatus,
  type SupplierQuotationItem,
} from '../../../types/quotation';
import type { ComparisonTableProps } from '../types';

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  quotation,
  selectedSupplierId,
  relevantSuppliers,
  selectedArticles,
  suppliersWithFinalSelection,
  finalSelection,
  signatures,
}) => {
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

  // Totales por proveedor
  const getSupplierTotal = (supplierId: number): number => {
    if (!selectedSupplierId) return 0;

    // Obtener los artículos adjudicados al proveedor seleccionado
    const selectedArticles =
      quotation.finalSelection?.finalSelectionItems
        .filter(item => item.supplier.id === selectedSupplierId)
        .map(item => item.requirementArticle.article.id) || [];

    if (selectedArticles.length === 0) return 0;

    const qs = quotation.quotationSuppliers.find(
      qs => qs.supplier.id === supplierId
    );

    if (!qs?.supplierQuotation?.supplierQuotationItems) return 0;

    // Calcular el total solo para los artículos adjudicados al proveedor seleccionado
    // y que estén cotizados (no NOT_AVAILABLE)
    const total = qs.supplierQuotation.supplierQuotationItems
      .filter(
        item =>
          selectedArticles.includes(item.requirementArticle.article.id) &&
          item.status === QuotationItemStatus.QUOTED
      )
      .reduce((sum, item) => sum + (item.totalPrice || 0), 0);

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

  return (
    <>
      <div className="mb-6 overflow-x-auto">
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
            {selectedArticles.map((art, idx) => (
              <tr key={art.id}>
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
                          {item.status === QuotationItemStatus.NOT_AVAILABLE ? (
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
              const total =
                quotation.finalSelection?.finalSelectionItems
                  .filter(item => item.supplier.id === selectedSupplierId)
                  .reduce((sum, item) => sum + (+item.totalPrice || 0), 0) || 0;
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {signatures.map((firma, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded shadow"
            >
              <div className="font-medium text-sm mb-1">{firma.label}</div>
              {firma.signed ? (
                <div className="text-xs text-green-600 dark:text-green-300 font-semibold">
                  Firmado
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
