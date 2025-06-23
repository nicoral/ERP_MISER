import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../../components/common/Table';
import {
  useRequirements,
  useDeleteRequirement,
  usePublishRequirement,
  useGenerateRequirementPdf,
} from '../hooks/useRequirements';
import type { Requirement } from '../../../types/requirement';
import { ROUTES } from '../../../config/constants';
import { useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  PublishIcon,
  TrashIcon,
  EditIcon,
} from '../../../components/common/Icons';
import { DownloadIcon } from 'lucide-react';
import { hasPermission } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';
import { useState } from 'react';

export const RequirementList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteRequirementMutation = useDeleteRequirement();
  const publishRequirementMutation = usePublishRequirement();
  const generatePdfMutation = useGenerateRequirementPdf();

  const [page, setPage] = useState(1);

  // Hook con datos y estados automáticos de React Query
  const { data, isLoading, isFetching } = useRequirements(page, 10);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil((data?.total ?? 0) / 10)) return;
    setPage(newPage);
  };

  const handleViewDetails = (requirement: Requirement) => {
    navigate(
      ROUTES.REQUIREMENTS_DETAILS.replace(':id', requirement.id.toString())
    );
  };

  const handleDownloadPdf = async (requirement: Requirement) => {
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
      render: (requirement: Requirement) => {
        const statusClasses = {
          PENDING:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          PUBLISHED:
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          APPROVED:
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          CANCELLED:
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };

        return (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              statusClasses[requirement.status as keyof typeof statusClasses]
            }`}
          >
            {requirement.status}
          </span>
        );
      },
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
              requirement.status !== 'PENDING',
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
      icon: <DownloadIcon className="w-5 h-5 text-blue-600" />,
      label: 'Descargar PDF',
      onClick: handleDownloadPdf,
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Requerimientos
        </h2>
        {hasPermission('create_requirement') && (
          <button
            onClick={() => navigate(ROUTES.REQUIREMENTS_CREATE)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-fit"
          >
            Crear Requerimiento
          </button>
        )}
      </div>

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
            generatePdfMutation.isPending
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
  );
};
