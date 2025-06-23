import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../../components/common/Table';
import { useRequirements } from '../hooks/useRequirements';
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
import {
  generateRequirementPdf,
  publishRequirement,
  deleteRequirement,
} from '../../../services/api/requirementService';
import { hasPermission } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';
import { useState } from 'react';

export const RequirementList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { requirements, loading, pagination, handlePageChange, refetch } =
    useRequirements(1, 10);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetails = (requirement: Requirement) => {
    navigate(
      ROUTES.REQUIREMENTS_DETAILS.replace(':id', requirement.id.toString())
    );
  };

  const handleDownloadPdf = (requirement: Requirement) => {
    generateRequirementPdf(requirement.id).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${requirement.code}.pdf`;
      a.click();
    });
    showSuccess('Descargado', 'Requerimiento descargado correctamente');
  };

  const handlePublish = (requirement: Requirement) => {
    publishRequirement(requirement.id)
      .then(() => {
        showSuccess('Publicado', 'Requerimiento publicado correctamente');
      })
      .catch(error => {
        showError('Error', error.message);
      })
      .finally(() => {
        refetch();
      });
  };

  const handleDelete = async (requirement: Requirement) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el requerimiento ${requirement.code}?`
      )
    ) {
      try {
        setIsDeleting(true);
        await deleteRequirement(requirement.id);
        showSuccess(
          'Eliminado',
          `Requerimiento ${requirement.code} eliminado correctamente`
        );
        refetch();
      } catch {
        showError('Error', 'No se pudo eliminar el requerimiento');
      } finally {
        setIsDeleting(false);
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
    <div className="sm:p-8 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Lista de Requerimientos
        </h2>
        {hasPermission('create_requirement') && (
          <button
            onClick={() => navigate(ROUTES.REQUIREMENTS_CREATE)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Crear requerimiento
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<Requirement>
          columns={columns}
          data={requirements}
          keyField="id"
          loading={loading || isDeleting}
          pagination={{
            page: pagination.page,
            totalPages: pagination.totalPages,
            onPageChange: handlePageChange,
          }}
          pageSize={pagination.pageSize}
          actions={actions}
        />
      </div>
    </div>
  );
};
