import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../../components/common/Table';
import {
  useRequirementsByType,
  useDeleteRequirement,
  usePublishRequirement,
  useGenerateRequirementPdf,
  useSignRequirement,
  useRejectRequirement,
} from '../hooks/useRequirements';
import type { Requirement } from '../../../types/requirement';
import { ROUTES } from '../../../config/constants';
import { useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  PublishIcon,
  TrashIcon,
  EditIcon,
  RejectIcon,
} from '../../../components/common/Icons';
import { DownloadIcon, Loader2 } from 'lucide-react';
import { hasPermission, canSignRequirement } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';
import { useState } from 'react';
import {
  getRequirementStatusColor,
  getRequirementStatusText,
} from '../../../utils/requirementStatus';
import { RejectModal } from './modals/RejectModal';

type RequirementType = 'ARTICLE' | 'SERVICE';

export const RequirementList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteRequirementMutation = useDeleteRequirement();
  const publishRequirementMutation = usePublishRequirement();
  const generatePdfMutation = useGenerateRequirementPdf();
  const signRequirementMutation = useSignRequirement();
  const rejectRequirementMutation = useRejectRequirement();

  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<RequirementType>('ARTICLE');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequirement, setSelectedRequirement] =
    useState<Requirement | null>(null);

  // Hook con datos filtrados por tipo
  const { data, isLoading, isFetching } = useRequirementsByType(
    selectedType,
    page,
    10
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil((data?.total ?? 0) / 10)) return;
    setPage(newPage);
  };

  const handleTypeChange = (type: RequirementType) => {
    setSelectedType(type);
    setPage(1); // Reset to first page when changing type
  };

  const handleViewDetails = (requirement: Requirement) => {
    navigate(
      ROUTES.REQUIREMENTS_DETAILS.replace(':id', requirement.id.toString())
    );
  };

  const handleDownloadPdf = async (requirement: Requirement) => {
    setDownloadingId(requirement.id);
    try {
      const blob = await generatePdfMutation.mutateAsync(requirement.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${requirement.code}.pdf`;
      a.click();
      showSuccess('Descargado', 'Requerimiento descargado correctamente');
    } catch {
      showError('Error', 'No se pudo descargar el PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePublish = async (requirement: Requirement) => {
    try {
      await publishRequirementMutation.mutateAsync(requirement.id);
      showSuccess('Publicado', 'Requerimiento publicado correctamente');
    } catch {
      showError('Error', 'No se pudo publicar el requerimiento');
    }
  };

  const handleSign = async (requirement: Requirement) => {
    try {
      await signRequirementMutation.mutateAsync(requirement.id);
      showSuccess('Firmado', 'Requerimiento firmado correctamente');
    } catch {
      showError('Error', 'No se pudo firmar el requerimiento');
    }
  };

  const handleOpenRejectModal = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setShowRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedRequirement(null);
  };

  const handleReject = async () => {
    if (!selectedRequirement) return;

    if (!rejectReason.trim()) {
      showError('Error', 'Debe proporcionar un motivo para el rechazo');
      return;
    }

    try {
      await rejectRequirementMutation.mutateAsync({
        id: selectedRequirement.id,
        reason: rejectReason.trim(),
      });
      showSuccess('Rechazado', 'Requerimiento rechazado correctamente');
      handleCloseRejectModal();
    } catch {
      showError('Error', 'No se pudo rechazar el requerimiento');
    }
  };

  const handleDelete = async (requirement: Requirement) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el requerimiento ${requirement.code}?`
      )
    ) {
      try {
        await deleteRequirementMutation.mutateAsync(requirement.id);
        showSuccess(
          'Eliminado',
          `Requerimiento ${requirement.code} eliminado correctamente`
        );
      } catch {
        showError('Error', 'No se pudo eliminar el requerimiento');
      }
    }
  };

  const handleEdit = (requirement: Requirement) => {
    navigate(ROUTES.REQUIREMENT_EDIT.replace(':id', requirement.id.toString()));
  };

  const columns: TableColumn<Requirement>[] = [
    {
      header: 'ID',
      accessor: 'id',
    },
    {
      header: 'Código',
      accessor: 'code',
    },
    {
      header: 'Solicitante',
      render: (requirement: Requirement) =>
        `${requirement.employee.firstName} ${requirement.employee.lastName}`,
    },
    {
      header: 'Prioridad',
      accessor: 'priority',
      render: (requirement: Requirement) => {
        const priorityClasses = {
          HIGH: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          MEDIUM:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          LOW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };

        return (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              priorityClasses[
                requirement.priority as keyof typeof priorityClasses
              ]
            }`}
          >
            {requirement.priority}
          </span>
        );
      },
    },
    {
      header: 'Centro de Costos',
      render: (requirement: Requirement) => requirement.costCenter.description,
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (requirement: Requirement) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRequirementStatusColor(
            requirement.status
          )}`}
        >
          {getRequirementStatusText(requirement.status)}
        </span>
      ),
    },
  ];

  const actions: TableAction<Requirement>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: 'Ver detalles',
      onClick: handleViewDetails,
    },
    ...(hasPermission('update_requirement')
      ? [
          {
            icon: <EditIcon className="w-5 h-5 text-blue-600" />,
            label: 'Editar',
            onClick: handleEdit,
            isHidden: (requirement: Requirement) =>
              requirement.status !== 'PENDING' &&
              requirement.status !== 'REJECTED',
          },
        ]
      : []),
    {
      icon: <PublishIcon className="w-5 h-5 text-green-600" />,
      label: 'Publicar',
      onClick: handlePublish,
      isHidden: (requirement: Requirement) => requirement.status !== 'PENDING',
    },
    {
      icon: (requirement: Requirement) =>
        downloadingId === requirement.id ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-white" />
        ) : (
          <DownloadIcon className="w-5 h-5 text-blue-600" />
        ),
      label: 'Descargar PDF',
      onClick: handleDownloadPdf,
      disabled: (requirement: Requirement) => downloadingId === requirement.id,
    },
    {
      icon: <PublishIcon className="w-5 h-5 text-purple-600" />,
      label: 'Firmar',
      onClick: handleSign,
      isHidden: (requirement: Requirement) => !canSignRequirement(requirement),
    },
    {
      icon: <RejectIcon className="w-5 h-5 text-red-600" />,
      label: 'Rechazar',
      onClick: handleOpenRejectModal,
      isHidden: (requirement: Requirement) => !canSignRequirement(requirement),
    },
    ...(hasPermission('delete_requirement')
      ? [
          {
            icon: <TrashIcon className="w-5 h-5 text-red-600" />,
            label: 'Eliminar',
            onClick: (requirement: Requirement) => handleDelete(requirement),
            isHidden: (requirement: Requirement) =>
              requirement.status !== 'PENDING',
          },
        ]
      : []),
  ];

  return (
    <div className="sm:p-8 p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:mb-6 mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Requerimientos
        </h2>
        {hasPermission('create_requirement') && (
          <button
            onClick={() =>
              navigate(
                ROUTES.REQUIREMENTS_CREATE.replace(
                  ':type',
                  selectedType.toLowerCase()
                )
              )
            }
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-fit"
          >
            {selectedType === 'ARTICLE'
              ? 'Crear Requerimiento de Compra'
              : 'Crear Requerimiento de Servicio'}
          </button>
        )}
      </div>

      {/* Tabs que ocupan todo el espacio con contenido enmarcado */}
      <div className="w-full bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl p-2 shadow-sm">
        {/* Tabs principales */}
        <div className="border-b border-gray-300 dark:border-gray-800 w-full">
          <nav className="-mb-px flex w-full">
            <div
              onClick={() => handleTypeChange('ARTICLE')}
              className={`flex-1 text-center cursor-pointer py-3 px-4 transition-all duration-200 rounded-t-lg
                ${
                  selectedType === 'ARTICLE'
                    ? 'bg-blue-100 dark:bg-blue-900 border-b-4 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-bold shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 border-b-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
              style={{ minWidth: 0 }}
            >
              <span className="truncate block">Artículos</span>
            </div>
            <div
              onClick={() => handleTypeChange('SERVICE')}
              className={`flex-1 text-center cursor-pointer py-3 px-4 transition-all duration-200 rounded-t-lg
                ${
                  selectedType === 'SERVICE'
                    ? 'bg-blue-100 dark:bg-blue-900 border-b-4 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-bold shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 border-b-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
              style={{ minWidth: 0 }}
            >
              <span className="truncate block">Servicios</span>
            </div>
          </nav>
        </div>

        {/* Contenido del tab seleccionado */}
        <div className="p-4">
          {/* Tabla */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <Table<Requirement>
              columns={columns}
              data={data?.requirements ?? []}
              keyField="id"
              loading={
                isLoading ||
                isFetching ||
                deleteRequirementMutation.isPending ||
                publishRequirementMutation.isPending ||
                signRequirementMutation.isPending
              }
              pagination={{
                page: page,
                totalPages: Math.ceil((data?.total ?? 0) / 10),
                onPageChange: handlePageChange,
              }}
              actions={actions}
              pageSize={10}
            />
          </div>
        </div>
      </div>

      <RejectModal
        isOpen={showRejectModal}
        onClose={handleCloseRejectModal}
        requirement={selectedRequirement as Requirement}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        handleReject={handleReject}
        rejectRequirementMutation={rejectRequirementMutation}
      />
    </div>
  );
};
