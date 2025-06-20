import React, { useState } from 'react';
import { WAREHOUSE_TEXTS } from '../../../config/texts';
import { EyeIcon, EditIcon, TrashIcon } from '../../../components/common/Icons';
import { FormInput } from '../../../components/common/FormInput';
import {
  Table,
  type TableAction,
  type TableColumn,
} from '../../../components/common/Table';
import type { Warehouse } from '../../../types/warehouse';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { Modal } from '../../../components/common/Modal';
import { WarehouseDetails } from './WarehouseDetails';
import { useWarehouses, useWarehouseDelete } from '../hooks/useWarehouse';
import { hasPermission } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';

export const WarehouseList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteWarehouseMutation = useWarehouseDelete();

  const [filters, setFilters] = useState({ search: '' });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );

  // Hook con datos y estados automáticos de React Query
  const { data, isLoading, isFetching } = useWarehouses(page, 10, {
    search: filters.search,
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '' });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > (data?.totalPages ?? 1)) return;
    setPage(newPage);
  };

  const handleCreate = () => navigate(ROUTES.WAREHOUSE_CREATE);
  const handleEdit = (id: number) =>
    navigate(ROUTES.WAREHOUSE_EDIT.replace(':id', id.toString()));

  const handleDelete = async (warehouse: Warehouse) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el almacén ${warehouse.name}?`
      )
    ) {
      try {
        await deleteWarehouseMutation.mutateAsync(warehouse.id);
        showSuccess(
          'Eliminado',
          `Almacén ${warehouse.name} eliminado correctamente`
        );
      } catch {
        showError('Error', 'No se pudo eliminar el almacén');
      }
    }
  };

  const columns: TableColumn<Warehouse>[] = [
    { header: WAREHOUSE_TEXTS.warehouses.table.columns.id, accessor: 'id' },
    { header: WAREHOUSE_TEXTS.warehouses.table.columns.name, accessor: 'name' },
    {
      header: WAREHOUSE_TEXTS.warehouses.table.columns.address,
      accessor: 'address',
    },
    {
      header: WAREHOUSE_TEXTS.warehouses.table.columns.employee,
      accessor: 'manager.firstName',
      accessor2: 'manager.lastName',
    },
    {
      header: WAREHOUSE_TEXTS.warehouses.table.columns.hireDate,
      accessor: 'hireDate',
    },
    {
      header: WAREHOUSE_TEXTS.warehouses.table.columns.valued,
      accessor: 'valued',
    },
    {
      header: WAREHOUSE_TEXTS.warehouses.table.columns.status,
      render: (wh: Warehouse) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            wh.active
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {wh.active
            ? WAREHOUSE_TEXTS.warehouses.table.status.active
            : WAREHOUSE_TEXTS.warehouses.table.status.inactive}
        </span>
      ),
    },
  ];

  const actions: TableAction<Warehouse>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: WAREHOUSE_TEXTS.warehouses.table.actions.view,
      onClick: (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse);
        setShowDetailsModal(true);
      },
    },
    ...(hasPermission('update_warehouse')
      ? [
          {
            icon: <EditIcon className="w-5 h-5 text-blue-600" />,
            label: WAREHOUSE_TEXTS.warehouses.table.actions.edit,
            onClick: (warehouse: Warehouse) => handleEdit(warehouse.id),
          },
        ]
      : []),
    ...(hasPermission('delete_warehouse')
      ? [
          {
            icon: <TrashIcon className="w-5 h-5 text-red-600" />,
            label: 'Eliminar',
            onClick: (warehouse: Warehouse) => handleDelete(warehouse),
          },
        ]
      : []),
  ];

  return (
    <div className="sm:p-8 p-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {WAREHOUSE_TEXTS.warehouses.title}
        </h2>
        {hasPermission('create_warehouse') && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 w-fit"
          >
            {WAREHOUSE_TEXTS.warehouses.buttons.create}
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex justify-between w-full text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md"
        >
          <span>{WAREHOUSE_TEXTS.warehouses.filters.title}</span>
          <svg
            className={`w-5 h-5 transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
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
                id="search"
                name="search"
                label={WAREHOUSE_TEXTS.warehouses.filters.search}
                value={filters.search}
                onChange={handleFilterChange}
                placeholder={
                  WAREHOUSE_TEXTS.warehouses.filters.searchPlaceholder
                }
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                {WAREHOUSE_TEXTS.warehouses.filters.clear}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<Warehouse>
          columns={columns}
          data={data?.data ?? []}
          keyField="id"
          loading={isLoading || isFetching || deleteWarehouseMutation.isPending}
          pagination={{
            page: page,
            totalPages: data?.totalPages ?? 1,
            onPageChange: handlePageChange,
          }}
          actions={actions}
          pageSize={10}
        />
      </div>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`🏢 ${selectedWarehouse?.name ?? ''}`}
      >
        {selectedWarehouse && (
          <WarehouseDetails warehouse={selectedWarehouse} />
        )}
      </Modal>
    </div>
  );
};
