import { useState } from 'react';
import type { CostCenter } from '../../../types/costCenter';
import type { TableAction, TableColumn } from '../../../types/table';
import { EditIcon, TrashIcon, EyeIcon } from '../../../components/common/Icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { FormInput } from '../../../components/common/FormInput';
import { Table } from '../../../components/common/Table';
import { hasPermission } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';
import { useCostCenters, useDeleteCostCenter } from '../hooks/useCostCenter';
import { CostCenterImportModal } from './CostCenterImportModal';

export const CostCenterList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteCostCenterMutation = useDeleteCostCenter();

  const [filters, setFilters] = useState({ description: '' });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Hook con datos y estados automáticos de React Query
  const { data, isLoading, isFetching, refetch } = useCostCenters(
    page,
    10,
    filters.description
  );

  const columns: TableColumn<CostCenter>[] = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Descripción',
      accessor: 'description',
    },
    {
      header: 'Código',
      accessor: 'code',
      render: row => row.code || '-',
    },
    {
      header: 'Serial',
      accessor: 'serial',
      render: row => row.serial || '-',
    },
    {
      header: 'Código Mina',
      accessor: 'codeMine',
      render: row => row.codeMine || '-',
    },
  ];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ description: '' });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > (data?.totalPages ?? 1)) return;
    setPage(newPage);
  };

  const handleCreate = () => navigate(ROUTES.COST_CENTER_CREATE);
  const handleEdit = (id: number) =>
    navigate(ROUTES.COST_CENTER_EDIT.replace(':id', id.toString()));

  const handleImportSuccess = () => {
    // Recargar la lista después de importar
    refetch();
  };

  const handleDelete = async (costCenter: CostCenter) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el centro de costo "${costCenter.description}"?`
      )
    ) {
      try {
        await deleteCostCenterMutation.mutateAsync(costCenter.id);
        showSuccess(
          'Eliminado',
          `Centro de costo "${costCenter.description}" eliminado correctamente`
        );
      } catch {
        showError('Error', 'No se pudo eliminar el centro de costo');
      }
    }
  };

  const actions: TableAction<CostCenter>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: 'Ver Detalles',
      onClick: (costCenter: CostCenter) => {
        navigate(
          ROUTES.COST_CENTER_DETAILS.replace(':id', costCenter.id.toString())
        );
      },
    },
    ...(hasPermission('update_cost_centers')
      ? [
          {
            icon: <EditIcon className="w-5 h-5 text-blue-600" />,
            label: 'Editar',
            onClick: (costCenter: CostCenter) => handleEdit(costCenter.id),
          },
        ]
      : []),
    ...(hasPermission('delete_cost_centers')
      ? [
          {
            icon: <TrashIcon className="w-5 h-5 text-red-600" />,
            label: 'Eliminar',
            onClick: (costCenter: CostCenter) => handleDelete(costCenter),
          },
        ]
      : []),
  ];

  return (
    <div className="sm:p-8 p-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Centros de Costo
        </h2>
        {hasPermission('create_cost_centers') && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Importar Equipos
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Crear Centro de Costo
            </button>
          </div>
        )}
      </div>

      {/* Import Modal */}
      <CostCenterImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />

      {/* Filtros colapsables */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-left text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 px-4 py-2 rounded-md"
        >
          <span className="font-medium text-base">Filtros</span>
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${
              showFilters ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                id="description"
                name="description"
                label="Descripción"
                value={filters.description}
                onChange={handleFilterChange}
                placeholder="Buscar por descripción..."
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<CostCenter>
          columns={columns}
          data={data?.data ?? []}
          keyField="id"
          loading={
            isLoading || isFetching || deleteCostCenterMutation.isPending
          }
          pagination={{
            page: page,
            totalPages: data?.totalPages ?? 1,
            onPageChange: handlePageChange,
          }}
          actions={actions}
          pageSize={10}
        />
      </div>
    </div>
  );
};
