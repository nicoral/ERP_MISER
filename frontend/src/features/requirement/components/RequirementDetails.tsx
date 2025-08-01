import React from 'react';
import {
  useRejectRequirement,
  useRequirement,
  useSignRequirement,
  useUploadInform,
} from '../hooks/useRequirements';
import { formatDate } from '../../../lib/utils';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import MyserLogo from '../../../assets/myser-logo.jpg';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import type {
  Requirement,
  RequirementArticle,
  RequirementService,
} from '../../../types/requirement';
import { canSignRequirement } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';
import { useCurrentExchangeRate } from '../../../hooks/useGeneralSettings';
import { useState } from 'react';
import { RequirementStatus } from '../../../types/requirement';
import { RejectModal } from './modals/RejectModal';
import { UploadInformModal } from './modals/uploadInform';

interface TableItem {
  id: number;
  code: string;
  name: string;
  quantity: number;
  unit: string;
  justification: string;
  currency: string;
  unitPrice: number;
  total: number;
}

interface RequirementDetailsProps {
  type?: 'ARTICLE' | 'SERVICE';
}

export const RequirementDetails = ({ type }: RequirementDetailsProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showUploadInformModal, setShowUploadInformModal] = useState(false);
  const [inform, setInform] = useState<File | null>(null);
  const {
    data: requirement,
    isLoading: loading,
    error,
    refetch,
  } = useRequirement(params.id ? Number(params.id) : 0);
  const { data: exchangeRate, isLoading: loadingExchangeRate } =
    useCurrentExchangeRate();
  const signRequirementMutation = useSignRequirement();
  const rejectRequirementMutation = useRejectRequirement();
  const uploadInformMutation = useUploadInform();
  // Mapear datos según el tipo de requerimiento
  const tableItems: TableItem[] = React.useMemo(() => {
    if (!requirement) return [];
    const reqType = type || requirement.type;
    if (reqType === 'ARTICLE') {
      return requirement.requirementArticles.map(
        (reqArticle: RequirementArticle) => ({
          id: reqArticle.article.id,
          code: reqArticle.article.code,
          name: reqArticle.article.name,
          quantity: reqArticle.quantity,
          unit: reqArticle.article.unitOfMeasure,
          justification: reqArticle.justification,
          currency: reqArticle.currency,
          unitPrice: reqArticle.unitPrice,
          total: reqArticle.quantity * reqArticle.unitPrice,
        })
      );
    } else {
      return requirement.requirementServices.map(
        (reqService: RequirementService) => ({
          id: reqService.service.id,
          code: reqService.service.code,
          name: reqService.service.name,
          quantity: reqService.duration || 0,
          unit: reqService.durationType || '-',
          justification: reqService.justification,
          currency: reqService.currency,
          unitPrice: reqService.unitPrice,
          total: reqService.unitPrice,
        })
      );
    }
  }, [requirement, type]);

  const subtotals = {
    PEN: tableItems
      .filter(item => item.currency === 'PEN')
      .reduce((sum, item) => sum + item.total, 0),
    USD: tableItems
      .filter(item => item.currency === 'USD')
      .reduce((sum, item) => sum + item.total, 0),
  };

  const handleSign = async () => {
    if (!requirement) return;

    try {
      await signRequirementMutation.mutateAsync(requirement.id);
      showSuccess('Firmado', 'Requerimiento firmado correctamente');
    } catch {
      showError('Error', 'No se pudo firmar el requerimiento');
    }
  };

  const handleReject = async () => {
    if (!requirement) return;

    if (!rejectReason.trim()) {
      showError('Error', 'Debe proporcionar un motivo para el rechazo');
      return;
    }

    try {
      await rejectRequirementMutation.mutateAsync({
        id: requirement.id,
        reason: rejectReason.trim(),
      });
      showSuccess('Rechazado', 'Requerimiento rechazado correctamente');
      setShowRejectModal(false);
      setRejectReason('');
      refetch();
    } catch {
      showError('Error', 'No se pudo rechazar el requerimiento');
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleCloseUploadInformModal = () => {
    setShowUploadInformModal(false);
  };

  const handleInformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInform(file);
    }
  };

  const handleSubmitInform = async () => {
    if (!requirement || !inform) return;

    try {
      await uploadInformMutation.mutateAsync({
        id: requirement.id,
        inform,
      });
      showSuccess('Informe subido', 'Informe subido correctamente');
      setShowUploadInformModal(false);
      refetch();
    } catch {
      showError('Error', 'No se pudo subir el informe');
    }
  };

  const changePriority = (priority: string) => {
    try {
      switch (priority) {
        case 'LOW':
          return 'BAJA';
        case 'MEDIUM':
          return 'MEDIA';
        case 'HIGH':
          return 'ALTA';
        default:
          return 'BAJA';
      }
    } catch {
      showError('Error', 'No se pudo cambiar la prioridad');
    }
  };

  const downloadInform = () => {
    if (!requirement?.inform) return;
    window.open(requirement.inform, '_blank');
  };

  if (loading || loadingExchangeRate) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error.message}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <img src={MyserLogo} alt="MYSER Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                FORMATO DE REQUERIMIENTO
              </h1>
              <h2 className="text-sm text-gray-600 dark:text-gray-400">
                SISTEMA INTEGRADO DE GESTIÓN
              </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">CÓDIGO</p>
            <p className="text-lg font-bold">MYS-LG-FT-01</p>
          </div>
        </div>
      </div>

      {/* Requirement Info */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700 grid grid-cols-4 gap-4 mb-6 text-sm">
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">N° Requerimiento</p>
          <p>{requirement?.code}</p>
        </div>
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Área Solicitante</p>
          <p>{requirement?.employee.area}</p>
        </div>
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Persona Solicitante</p>
          <p>{`${requirement?.employee.firstName} ${requirement?.employee.lastName}`}</p>
        </div>
        <div>
          <p className="font-medium mb-1">Fecha de Emisión</p>
          <p>{formatDate(requirement?.createdAt || '')}</p>
        </div>
      </div>

      {/* Cost Center Info */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700 grid grid-cols-5 gap-4 mb-6 text-sm">
        <div className="col-span-2 border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Centro de Costo</p>
          <p>{requirement?.costCenter.description}</p>
        </div>
        <div className="col-span-2 border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Centro de Costo Secundario</p>
          <p>{requirement?.costCenterSecondary.description}</p>
        </div>
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Prioridad</p>
          <p>{changePriority(requirement?.priority || '')}</p>
        </div>
      </div>

      {/* Articles/Services Table */}
      <div className="mb-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Item
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Unid
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Código
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Justificación
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Moneda
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Costo Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tableItems.map((item, index) => (
              <tr key={item.id}>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {String(index + 1).padStart(3, '0')}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {item.quantity}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {item.unit}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {item.code}
                </td>
                <td className="px-3 py-2 text-sm">{item.name}</td>
                <td className="px-3 py-2 text-sm">{item.justification}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                  {item.currency}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                  {(+item.total).toFixed(2)}
                </td>
              </tr>
            ))}
            {/* Subtotal PEN */}
            {subtotals.PEN > 0 && (
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td colSpan={7} className="px-3 py-2 text-right font-medium">
                  SUBTOTAL PEN
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {subtotals.PEN.toFixed(2)}
                </td>
              </tr>
            )}
            {/* Subtotal USD */}
            {subtotals.USD > 0 && (
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td
                  colSpan={6}
                  className="px-3 py-2 text-right font-small text-sm"
                >
                  Tipo de cambio: {exchangeRate?.saleRate} / PEN{' '}
                  {(subtotals.USD * (exchangeRate?.saleRate || 0)).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  SUBTOTAL USD
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {subtotals.USD.toFixed(2)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Observations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Observaciones:</h3>
        <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
          {requirement?.observation || 'Sin observaciones'}
        </p>
      </div>

      {/* Rechazo */}
      {requirement?.rejectedReason && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-red-500">Rechazo:</h3>
          <p className="text-sm bg-red-50 dark:bg-red-700 p-3 rounded">
            {requirement?.rejectedReason || 'Sin motivo de rechazo'}
          </p>
        </div>
      )}

      {/* Firmas */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Firmas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Solicitante', date: requirement?.firstSignedAt },
            { label: 'Oficina Técnica', date: requirement?.secondSignedAt },
            { label: 'Administración', date: requirement?.thirdSignedAt },
            { label: 'Gerencia', date: requirement?.fourthSignedAt },
          ].map((firma, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded shadow"
            >
              <div className="font-medium text-sm mb-1">{firma.label}</div>
              {firma.date ? (
                <div className="text-xs text-green-600 dark:text-green-300 font-semibold">
                  {new Date(firma.date).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">Pendiente</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between">
        <button
          onClick={() =>
            navigate(
              type === 'ARTICLE'
                ? ROUTES.REQUIREMENTS_ARTICLES
                : ROUTES.REQUIREMENTS_SERVICES
            )
          }
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Volver
        </button>
        <div className="flex space-x-2">
          {requirement && requirement.inform && (
            <button
              onClick={downloadInform}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ver Informe
            </button>
          )}
          {requirement &&
            !requirement.inform &&
            !requirement.firstSignedAt &&
            requirement.type === 'SERVICE' && (
              <button
                onClick={() => setShowUploadInformModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Subir Informe
              </button>
            )}
          {requirement && canSignRequirement(requirement) && (
            <button
              onClick={handleSign}
              disabled={signRequirementMutation.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {signRequirementMutation.isPending ? 'Firmando...' : 'Firmar'}
            </button>
          )}

          {requirement &&
            canSignRequirement(requirement, true) &&
            requirement.status !== RequirementStatus.REJECTED && (
              <button
                onClick={handleRejectClick}
                disabled={rejectRequirementMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectRequirementMutation.isPending
                  ? 'Rechazando...'
                  : 'Rechazar'}
              </button>
            )}
        </div>
      </div>

      <RejectModal
        isOpen={showRejectModal}
        onClose={handleCloseRejectModal}
        requirement={requirement as Requirement}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        handleReject={handleReject}
        rejectRequirementMutation={rejectRequirementMutation}
      />
      <UploadInformModal
        isOpen={showUploadInformModal}
        onClose={handleCloseUploadInformModal}
        handleInformChange={handleInformChange}
        handleSubmit={handleSubmitInform}
      />
    </div>
  );
};
