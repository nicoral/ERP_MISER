import React from 'react';
import { useQuotationService } from '../../../hooks/useQuotationService';
import { quotationService } from '../../../services/api/quotationService';
import { formatDate } from '../../../lib/utils';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import MyserLogo from '../../../assets/myser-logo.jpg';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import {
  getQuotationStatusText,
  formatCurrency,
} from '../../../utils/quotationUtils';
import {
  QuotationItemStatus,
  type QuotationRequest,
  type SupplierQuotationItem,
} from '../../../types/quotation';

export const QuotationDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { getQuotationRequest, loading, error } = useQuotationService();

  const [quotation, setQuotation] = React.useState<QuotationRequest | null>(
    null
  );

  React.useEffect(() => {
    const loadQuotation = async () => {
      if (params.id) {
        const result = await getQuotationRequest(Number(params.id));
        if (result) {
          setQuotation(result);
        }
      }
    };
    loadQuotation();
  }, [params.id, getQuotationRequest]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!quotation)
    return <div className="text-red-500">Cotización no encontrada</div>;

  // Preparar datos para la tabla comparativa
  const suppliers = quotation.quotationSuppliers.map(qs => ({
    ...qs.supplier,
    quotationSupplier: qs,
    supplierQuotation: qs.supplierQuotation,
  }));
  const articles = quotation.requirement.requirementArticles;

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
    const qs = quotation.quotationSuppliers.find(
      qs => qs.supplier.id === supplierId
    );
    return qs?.supplierQuotation?.totalAmount || 0;
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

  // Proveedores seleccionados (de la selección final)
  const finalSelection = quotation.finalSelection;

  const finalSuppliersWithTotal =
    quotation.finalSelection?.finalSelectionItems
      .map(item => item.supplier)
      .filter(
        (supplier, index, self) =>
          self.findIndex(s => s.id === supplier.id) === index
      )
      .map(supplier => {
        const total = quotation.finalSelection.finalSelectionItems
          .filter(item => item.supplier.id === supplier.id)
          .reduce((sum, item) => sum + (+item.totalPrice || 0), 0);
        return { supplier, total };
      }) || [];

  // Firmas (similares a requerimiento)
  const signatures = [
    { label: 'Logística', signed: !!quotation.finalSelection?.createdAt },
    { label: 'Of. Técnica', signed: false },
    { label: 'Administración', signed: false },
    { label: 'Gerencia', signed: false },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {/* Header */}
      <div className="border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <img src={MyserLogo} alt="MYSER Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                CUADRO COMPARATIVO DE OFERTAS
              </h1>
              <h2 className="text-sm text-gray-600 dark:text-gray-400">
                SISTEMA INTEGRADO DE GESTIÓN
              </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">CÓDIGO</p>
            <p className="text-lg font-bold">MYS-LG-FT-08</p>
          </div>
        </div>
        {/* Cotización Info */}
        <div className="border-b border-t mt-6 pt-4 border-gray-200 pb-4 dark:border-gray-700 grid grid-cols-4 gap-4 mb-6 text-sm">
          <div className="border-r border-gray-200 dark:border-gray-700">
            <p className="font-medium mb-1">N° Cotización</p>
            <p>{quotation.code}</p>
          </div>
          <div className="border-r border-gray-200 dark:border-gray-700">
            <p className="font-medium mb-1">Proyecto</p>
            <p>{quotation.requirement.observation || '-'}</p>
          </div>
          <div className="border-r border-gray-200 dark:border-gray-700">
            <p className="font-medium mb-1">N° Requerimiento</p>
            <p>{quotation.requirement.code}</p>
          </div>
          <div>
            <p className="font-medium mb-1">Fecha de Emisión</p>
            <p>{formatDate(quotation.createdAt.toString())}</p>
          </div>
        </div>
        <div className="border-b  border-gray-200 pb-4 dark:border-gray-700 grid grid-cols-4 gap-4 mb-6 text-sm">
          <div className="border-r border-gray-200 dark:border-gray-700">
            <p className="font-medium mb-1">Requerido por</p>
            <p>
              {quotation.requirement.employee.firstName}{' '}
              {quotation.requirement.employee.lastName}
            </p>
          </div>
          <div className="border-r border-gray-200 dark:border-gray-700">
            <p className="font-medium mb-1">Preparado por</p>
            <p>
              {quotation.createdBy.firstName} {quotation.createdBy.lastName}
            </p>
          </div>
          <div className="border-r border-gray-200 dark:border-gray-700">
            <p className="font-medium mb-1">Estado</p>
            <p>{getQuotationStatusText(quotation.status)}</p>
          </div>
          <div>
            <p className="font-medium mb-1">-</p>
            <p></p>
          </div>
        </div>
      </div>

      {/* Tabla comparativa */}
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
                colSpan={suppliers.length}
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
              {suppliers.map((s, idx) => (
                <td
                  key={s.id}
                  className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''}`}
                >
                  {s.businessName}
                </td>
              ))}
            </tr>
            {/* Fila de RUC */}
            <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <td className="px-3 py-2" colSpan={3}></td>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                RUC
              </th>
              {suppliers.map((s, idx) => (
                <td
                  key={s.id}
                  className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''}`}
                >
                  {s.ruc}
                </td>
              ))}
            </tr>
            {/* Fila de COTIZACIÓN N° */}
            <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <td className="px-3 py-2" colSpan={3}></td>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                COTIZACIÓN N°
              </th>
              {suppliers.map((s, idx) => (
                <td
                  key={s.id}
                  className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''}`}
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
              {suppliers.map((s, idx) => (
                <td
                  key={s.id}
                  className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''}`}
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
              {suppliers.map((s, idx) => (
                <td
                  key={s.id}
                  className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''}`}
                >
                  {s.quotationSupplier.supplier.email || '-'}
                </td>
              ))}
            </tr>
            {/* Fila de UBICACIÓN */}
            <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <td className="px-3 py-2" colSpan={3}></td>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                UBICACIÓN
              </th>
              {suppliers.map((s, idx) => (
                <td
                  key={s.id}
                  className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''}`}
                >
                  {s.quotationSupplier.supplier.address || '-'}
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
                colSpan={suppliers.length}
              >
                EVALUACIÓN
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {articles.map((art, idx) => (
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
                {suppliers.map((s, idx) => {
                  const item = getSupplierItem(s.id, art.article.id);
                  return (
                    <td
                      key={s.id}
                      className={`px-3 py-2 text-sm text-center align-top${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''}`}
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
              {suppliers.map((s, idx) => (
                <td
                  key={s.id}
                  className={`px-3 py-2 text-center align-middle font-medium${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''}`}
                >
                  {formatCurrency(getSupplierTotal(s.id), 'PEN')}
                </td>
              ))}
            </tr>
            {/* Tiempo de entrega */}
            <tr className="bg-white dark:bg-gray-800">
              <td className="px-3 py-2 text-right" colSpan={4}>
                TIEMPO DE ENTREGA
              </td>
              {suppliers.map((s, idx) => (
                <td
                  key={s.id}
                  className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''}`}
                >
                  {getSupplierDelivery(s.id)}
                </td>
              ))}
            </tr>
            {/* Condiciones de pago */}
            <tr className="bg-white dark:bg-gray-800">
              <td className="px-3 py-2 text-right" colSpan={4}>
                CONDICIONES DE PAGO
              </td>
              {suppliers.map((s, idx) => (
                <td
                  key={s.id}
                  className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''}`}
                >
                  {getSupplierTerms(s.id)}
                </td>
              ))}
            </tr>
            {/* Observaciones */}
            <tr className="bg-white dark:bg-gray-800">
              <td className="px-3 py-2 text-right" colSpan={4}>
                OBSERVACIONES
              </td>
              {suppliers.map((s, idx) => (
                <td
                  key={s.id}
                  className={`px-3 py-2 text-center text-sm${idx > 0 ? ' border-l border-gray-200 dark:border-gray-700' : ''}`}
                >
                  {getSupplierNotes(s.id)}
                </td>
              ))}
            </tr>
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
            {finalSuppliersWithTotal.length > 0 ? (
              finalSuppliersWithTotal.map((s, idx) => {
                return (
                  <tr key={`${s.supplier.id}-${idx}`}>
                    <td className="px-3 py-2 text-sm">{s.supplier.ruc}</td>
                    <td className="px-3 py-2 text-sm">
                      {s.supplier.businessName}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {s.supplier.address || '-'}
                    </td>
                    <td className="px-3 py-2 text-center text-sm font-semibold">
                      {formatCurrency(s.total, 'PEN')}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-2 text-center text-sm text-gray-400"
                >
                  Sin proveedor seleccionado
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

      {/* Botones */}
      <div className="flex justify-between mt-4">
        <button
          onClick={async () => {
            try {
              const blob =
                await quotationService.downloadQuotationComparisonPdf(
                  quotation.id
                );
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `cuadro_comparativo_${quotation.id}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            } catch (error) {
              console.error('Error al descargar el PDF:', error);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Descargar PDF
        </button>
        <button
          onClick={() => navigate(ROUTES.QUOTATIONS)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
};
