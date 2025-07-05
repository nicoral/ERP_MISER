import React from 'react';
import { useQuotationService } from '../../../hooks/useQuotationService';
import { quotationService } from '../../../services/api/quotationService';
import { formatDate } from '../../../lib/utils';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import MyserLogo from '../../../assets/myser-logo.jpg';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { getQuotationStatusText } from '../../../utils/quotationUtils';
import { type QuotationRequest } from '../../../types/quotation';
import { useToast } from '../../../contexts/ToastContext';
import { ComparisonTable } from './ComparisonTable';
import { PurchaseOrder } from './PurchaseOrder';
import {
  hasPermission,
  canSignQuotation,
  getQuotationSignButtonText,
} from '../../../utils/permissions';
import type { Signature } from '../types';

export const QuotationDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const {
    getQuotationRequest,
    signQuotationRequest,
    rejectQuotationRequest,
    loading,
  } = useQuotationService();

  const [quotation, setQuotation] = React.useState<QuotationRequest | null>(
    null
  );
  const [selectedSupplierId, setSelectedSupplierId] = React.useState<
    number | null
  >(null);
  const [selectedInternalTab, setSelectedInternalTab] = React.useState<
    'comparison' | 'purchase-order'
  >('comparison');
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isSigning, setIsSigning] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [showRejectModal, setShowRejectModal] = React.useState(false);

  React.useEffect(() => {
    const loadQuotation = async () => {
      if (params.id) {
        const result = await getQuotationRequest(Number(params.id));
        if (result) {
          setQuotation(result);
          // Seleccionar el primer proveedor con selección final por defecto
          const suppliersWithFinalSelection =
            result.finalSelection?.finalSelectionItems
              .map(item => item.supplier)
              .filter(
                (supplier, index, self) =>
                  self.findIndex(s => s.id === supplier.id) === index
              ) || [];

          if (suppliersWithFinalSelection.length > 0) {
            setSelectedSupplierId(suppliersWithFinalSelection[0].id);
          }
        }
      }
    };
    loadQuotation();
  }, [params.id, getQuotationRequest]);

  // Función para firmar la cotización
  const handleSignQuotation = async () => {
    if (!quotation) return;

    setIsSigning(true);
    try {
      const updatedQuotation = await signQuotationRequest(quotation.id);
      if (updatedQuotation) {
        setQuotation(updatedQuotation);
        showSuccess('Cotización firmada exitosamente');
      }
    } catch (error) {
      showError('Error al firmar la cotización');
      console.error('Error signing quotation:', error);
    } finally {
      setIsSigning(false);
    }
  };

  // Función para rechazar la cotización
  const handleRejectQuotation = async () => {
    if (!quotation || !rejectReason.trim()) return;

    setIsRejecting(true);
    try {
      const updatedQuotation = await rejectQuotationRequest(
        quotation.id,
        rejectReason
      );
      if (updatedQuotation) {
        setQuotation(updatedQuotation);
        setShowRejectModal(false);
        setRejectReason('');
        showSuccess('Cotización rechazada exitosamente');
      }
    } catch (error) {
      showError('Error al rechazar la cotización');
      console.error('Error rejecting quotation:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  // Verificar si el usuario puede firmar
  const canSign = quotation && canSignQuotation(quotation);
  const canReject = quotation && hasPermission('quotation:reject');
  const isCompleted = quotation?.status === 'COMPLETED';
  const isSigned =
    quotation?.status?.startsWith('SIGNED_') ||
    quotation?.status === 'APPROVED';

  const isRejected = quotation?.status === 'REJECTED';

  if (loading) return <LoadingSpinner />;
  if (!quotation)
    return <div className="text-red-500">Cotización no encontrada</div>;

  // Obtener proveedores que tienen artículos seleccionados en la selección final
  const getRelevantSuppliers = () => {
    if (!quotation.finalSelection) return [];

    const selectedArticleIds = quotation.finalSelection.finalSelectionItems
      .filter(item => item.supplier.id === selectedSupplierId)
      .map(item => item.requirementArticle.article.id);

    const relevantSuppliers = quotation.quotationSuppliers
      .filter(qs => {
        return qs.supplierQuotation?.supplierQuotationItems?.some(item =>
          selectedArticleIds.includes(item.requirementArticle.article.id)
        );
      })
      .map(qs => ({
        supplier: qs.supplier,
        supplierQuotation: qs.supplierQuotation,
        terms: qs.terms,
      }));

    // Ordenar para que el proveedor seleccionado aparezca primero
    return relevantSuppliers.sort((a, b) => {
      if (a.supplier.id === selectedSupplierId) return -1;
      if (b.supplier.id === selectedSupplierId) return 1;
      return 0;
    });
  };

  // Obtener artículos seleccionados para el proveedor actual
  const getSelectedArticles = () => {
    if (!quotation.finalSelection || !selectedSupplierId) return [];

    const selectedArticleIds = quotation.finalSelection.finalSelectionItems
      .filter(item => item.supplier.id === selectedSupplierId)
      .map(item => item.requirementArticle.article.id);

    return quotation.requirement.requirementArticles
      .filter(reqArticle => selectedArticleIds.includes(reqArticle.article.id))
      .map(reqArticle => ({
        id: reqArticle.id,
        article: reqArticle.article,
        quantity: reqArticle.quantity,
      }));
  };

  const relevantSuppliers = getRelevantSuppliers();
  const selectedArticles = getSelectedArticles();

  // Proveedores seleccionados (de la selección final)
  const finalSelection = quotation.finalSelection;

  // Firmas basadas en el estado real de la cotización
  const signatures: Signature[] = [
    {
      label: 'Logística',
      signed: !!quotation.firstSignedBy,
      signedBy: quotation.firstSignedBy,
      signedAt: quotation.firstSignedAt,
    },
    {
      label: 'Of. Técnica',
      signed: !!quotation.secondSignedBy,
      signedBy: quotation.secondSignedBy,
      signedAt: quotation.secondSignedAt,
    },
    {
      label: 'Administración',
      signed: !!quotation.thirdSignedBy,
      signedBy: quotation.thirdSignedBy,
      signedAt: quotation.thirdSignedAt,
    },
    {
      label: 'Gerencia',
      signed: !!quotation.fourthSignedBy,
      signedBy: quotation.fourthSignedBy,
      signedAt: quotation.fourthSignedAt,
    },
  ];

  // Obtener proveedores que tienen artículos en la selección final
  const suppliersWithFinalSelection =
    quotation.finalSelection?.finalSelectionItems
      .map(item => item.supplier)
      .filter(
        (supplier, index, self) =>
          self.findIndex(s => s.id === supplier.id) === index
      )
      .map(supplier => ({
        id: supplier.id,
        businessName: supplier.businessName,
        ruc: supplier.ruc,
        address: supplier.address,
      })) || [];

  const handleDownloadPdf = async () => {
    if (!selectedSupplierId) {
      showError('No hay proveedor seleccionado');
      return;
    }
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
    } catch (error) {
      showError('Error al descargar el PDF');
      console.error('Error al descargar el PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Renderizar contenido del tab interno
  const renderInternalTabContent = () => {
    if (selectedInternalTab === 'comparison') {
      return (
        <ComparisonTable
          quotation={quotation}
          selectedSupplierId={selectedSupplierId}
          relevantSuppliers={relevantSuppliers}
          selectedArticles={selectedArticles}
          suppliersWithFinalSelection={suppliersWithFinalSelection}
          finalSelection={finalSelection}
          signatures={signatures}
        />
      );
    } else {
      return (
        <PurchaseOrder
          quotation={quotation}
          selectedSupplierId={selectedSupplierId}
          selectedArticles={selectedArticles}
          signatures={signatures}
        />
      );
    }
  };

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

      {/* Tabs de proveedores (externos) y contenido enmarcado */}
      {suppliersWithFinalSelection.length > 0 && (
        <div className="mb-6 w-full bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl p-2 shadow-sm">
          {/* Tabs de proveedores */}
          <div className="border-b border-gray-300 dark:border-gray-800 w-full">
            <nav className="-mb-px flex w-full">
              {suppliersWithFinalSelection.map(supplier => (
                <div
                  key={supplier.id}
                  onClick={() => setSelectedSupplierId(supplier.id)}
                  className={`flex-1 text-center cursor-pointer py-3 px-4 transition-all duration-200 rounded-t-lg
                    ${
                      selectedSupplierId === supplier.id
                        ? 'bg-blue-100 dark:bg-blue-900 border-b-4 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-bold shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 border-b-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                  style={{ minWidth: 0 }}
                >
                  <span className="truncate block">
                    {supplier.businessName}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          {/* Tabs internos para cada proveedor */}
          {selectedSupplierId && (
            <div className="mb-6 w-4/5 mx-auto">
              <div className="bg-white dark:bg-gray-100/10 rounded-lg border border-gray-200 dark:border-gray-700 mt-4 p-1 shadow-none">
                <nav className="-mb-px flex w-full">
                  <div
                    onClick={() => setSelectedInternalTab('comparison')}
                    className={`flex-1 text-center cursor-pointer py-2 px-2 transition-all duration-200 rounded-md mx-1
                      ${
                        selectedInternalTab === 'comparison'
                          ? 'bg-blue-50 dark:bg-blue-200/10 border-b-4 border-blue-300 dark:border-blue-200 text-blue-500 dark:text-blue-200 font-semibold'
                          : 'bg-gray-50 dark:bg-gray-200/10 border-b-4 border-transparent text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-300/10'
                      }
                    `}
                  >
                    <span className="truncate block">Cuadro Comparativo</span>
                  </div>
                  <div
                    onClick={() => setSelectedInternalTab('purchase-order')}
                    className={`flex-1 text-center cursor-pointer py-2 px-2 transition-all duration-200 rounded-md mx-1
                      ${
                        selectedInternalTab === 'purchase-order'
                          ? 'bg-blue-50 dark:bg-blue-200/10 border-b-4 border-blue-300 dark:border-blue-200 text-blue-500 dark:text-blue-200 font-semibold'
                          : 'bg-gray-50 dark:bg-gray-200/10 border-b-4 border-transparent text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-300/10'
                      }
                    `}
                  >
                    <span className="truncate block">Orden de Compra</span>
                  </div>
                </nav>
              </div>
            </div>
          )}

          {/* Contenido de los tabs internos */}
          {selectedSupplierId &&
            relevantSuppliers.length > 0 &&
            renderInternalTabContent()}
        </div>
      )}

      {/* Botones fuera del bloque enmarcado */}
      <div className="flex justify-between mt-4">
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[140px]"
            disabled={!selectedSupplierId || isDownloading}
          >
            {isDownloading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Descargando...
              </span>
            ) : (
              'Descargar Cotización'
            )}
          </button>

          {/* Botones de aprobación */}
          {isCompleted && canSign && !isSigned && !isRejected && (
            <button
              onClick={handleSignQuotation}
              disabled={isSigning}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center min-w-[140px]"
            >
              {isSigning ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Firmando...
                </span>
              ) : (
                getQuotationSignButtonText(quotation)
              )}
            </button>
          )}

          {isCompleted && canReject && !isSigned && !isRejected && (
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Rechazar
            </button>
          )}
        </div>

        <button
          onClick={() => navigate(ROUTES.QUOTATIONS)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Volver
        </button>
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Rechazar Cotización
            </h3>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Ingrese el motivo del rechazo..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 dark:bg-gray-700 dark:text-white"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectQuotation}
                disabled={!rejectReason.trim() || isRejecting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                {isRejecting ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Rechazando...
                  </span>
                ) : (
                  'Rechazar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
