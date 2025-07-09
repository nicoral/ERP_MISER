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
} from '../hooks/useRequirements';
import type { Requirement } from '../../../types/requirement';
import { ROUTES } from '../../../config/constants';
import { useNavigate, useParams } from 'react-router-dom';
import { EyeIcon, TrashIcon, EditIcon } from '../../../components/common/Icons';
import { DownloadIcon, Loader2 } from 'lucide-react';
import { hasPermission } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';
import { useState } from 'react';
import {
  getRequirementStatusColor,
  getRequirementStatusText,
} from '../../../utils/requirementStatus';

type RequirementType = 'ARTICLE' | 'SERVICE';

export const RequirementList = (props: { type?: RequirementType }) => {
  const params = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteRequirementMutation = useDeleteRequirement();
  const publishRequirementMutation = usePublishRequirement();
  const generatePdfMutation = useGenerateRequirementPdf();
  const signRequirementMutation = useSignRequirement();

  const [page, setPage] = useState(1);
  // Determinar el tipo por prop, por params, o default 'ARTICLE'
  const typeParam = props.type || params.type || 'ARTICLE';
  const selectedType = (typeParam.toUpperCase?.() ||
    'ARTICLE') as RequirementType;

  const [downloadingId, setDownloadingId] = useState<number | null>(null);

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

  const handleViewDetails = (requirement: Requirement) => {
    if (selectedType === 'ARTICLE') {
      navigate(
        ROUTES.REQUIREMENTS_ARTICLES_DETAILS.replace(
          ':id',
          requirement.id.toString()
        )
      );
    } else {
      navigate(
        ROUTES.REQUIREMENTS_SERVICES_DETAILS.replace(
          ':id',
          requirement.id.toString()
        )
      );
    }
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
    if (selectedType === 'ARTICLE') {
      navigate(
        ROUTES.REQUIREMENTS_ARTICLES_EDIT.replace(
          ':id',
          requirement.id.toString()
        )
      );
    } else {
      navigate(
        ROUTES.REQUIREMENTS_SERVICES_EDIT.replace(
          ':id',
          requirement.id.toString()
        )
      );
    }
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
          {'Requerimientos de '}
          {selectedType === 'ARTICLE' ? 'Compras' : 'Servicios'}
        </h2>
        {hasPermission('create_requirement') && (
          <button
            onClick={() =>
              navigate(
                selectedType === 'ARTICLE'
                  ? ROUTES.REQUIREMENTS_ARTICLES_CREATE
                  : ROUTES.REQUIREMENTS_SERVICES_CREATE
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

      {/* Eliminar los tabs, solo mostrar la tabla */}
      <div className="w-full bg-gray-200 dark:bg-gray-900 rounded-xl p-2 shadow-sm">
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
  );
};
