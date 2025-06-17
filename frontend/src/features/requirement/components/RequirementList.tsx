import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../../components/common/Table';
import { useRequirements } from '../hooks/useRequirements';
import type { Requirement } from '../../../types/requirement';
import { ROUTES } from '../../../config/constants';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '../../../components/common/Icons';
import { Modal } from '../../../components/common/Modal';
import { RequirementDetails } from './RequirementDetails';
import { useState } from 'react';

export const RequirementList = () => {
  const navigate = useNavigate();
  const { requirements, loading, pagination, handlePageChange } =
    useRequirements(1, 10);

  const [selectedRequirement, setSelectedRequirement] =
    useState<Requirement | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleViewDetails = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setShowDetailsModal(true);
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
      render: (requirement: Requirement) => requirement.costCenter.name,
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (requirement: Requirement) => {
        const statusClasses = {
          PENDING:
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          APPROVED:
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
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
  ];

  return (
    <div className="sm:p-8 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Lista de Requerimientos
        </h2>
        <button
          onClick={() => navigate(ROUTES.REQUIREMENTS_CREATE)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Crear requerimiento
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<Requirement>
          columns={columns}
          data={requirements}
          keyField="id"
          loading={loading}
          pagination={{
            page: pagination.page,
            totalPages: pagination.totalPages,
            onPageChange: handlePageChange,
          }}
          pageSize={pagination.pageSize}
          actions={actions}
        />
      </div>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Detalles del Requerimiento"
      >
        {selectedRequirement && (
          <RequirementDetails requirementInput={selectedRequirement} />
        )}
      </Modal>
    </div>
  );
};
