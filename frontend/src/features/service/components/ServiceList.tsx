import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WAREHOUSE_TEXTS } from '../../../config/texts';
import { EyeIcon, EditIcon, TrashIcon } from '../../../components/common/Icons';
import { FormInput } from '../../../components/common/FormInput';
import {
  Table,
  type TableAction,
  type TableColumn,
} from '../../../components/common/Table';
import { useServices, useDeleteService } from '../hooks/useServices';
import { ROUTES } from '../../../config/constants';
import { useToast } from '../../../contexts/ToastContext';
import { hasPermission } from '../../../utils/permissions';
import type { Service } from '../../../types/service';

export const ServiceList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteServiceMutation = useDeleteService();

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // React Query hook para obtener servicios
  const { data: servicesResponse, isLoading } = useServices(
    pagination.page,
    pagination.pageSize,
    search || undefined
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const applySearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearSearch = () => {
    setSearch('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (service: Service) => {
    if (
      !window.confirm('¿Estás seguro de que quieres eliminar este servicio?')
    ) {
      return;
    }

    try {
      await deleteServiceMutation.mutateAsync(service.id);
      showSuccess(
        'Eliminado',
        `Servicio ${service.name} eliminado correctamente`
      );
    } catch {
      showError('Error', 'No se pudo eliminar el servicio');
    }
  };

  const columns: TableColumn<Service>[] = [
    { header: 'ID', accessor: 'id' },
    { header: WAREHOUSE_TEXTS.services.table.columns.code, accessor: 'code' },
    { header: WAREHOUSE_TEXTS.services.table.columns.name, accessor: 'name' },
    {
      header: WAREHOUSE_TEXTS.services.table.columns.status,
      render: (srv: Service) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            srv.active
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {srv.active
            ? WAREHOUSE_TEXTS.services.table.status.active
            : WAREHOUSE_TEXTS.services.table.status.inactive}
        </span>
      ),
    },
  ];

  const actions: TableAction<Service>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: WAREHOUSE_TEXTS.services.table.actions.view,
      onClick: (service: Service) =>
        navigate(`${ROUTES.SERVICES}/${service.id}`),
    },
    ...(hasPermission('update_service')
      ? [
          {
            icon: <EditIcon className="w-5 h-5 text-blue-600" />,
            label: WAREHOUSE_TEXTS.services.table.actions.edit,
            onClick: (service: Service) =>
              navigate(`${ROUTES.SERVICES}/edit/${service.id}`),
          },
        ]
      : []),
    ...(hasPermission('delete_service')
      ? [
          {
            icon: <TrashIcon className="w-5 h-5 text-red-600" />,
            label: WAREHOUSE_TEXTS.services.table.actions.delete,
            onClick: handleDelete,
          },
        ]
      : []),
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {WAREHOUSE_TEXTS.services.title}
        </h2>
        {hasPermission('create_service') && (
          <button
            onClick={() => navigate(`${ROUTES.SERVICES}/create`)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {WAREHOUSE_TEXTS.services.buttons.create}
          </button>
        )}
      </div>

      {/* Filtros colapsables */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-left text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 px-4 py-2 rounded-md"
        >
          <span className="font-medium text-base">
            {WAREHOUSE_TEXTS.services.filters.title}
          </span>
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="search"
                name="search"
                label="Buscar"
                value={search}
                onChange={handleSearchChange}
                placeholder="Buscar por código o nombre..."
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={clearSearch}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                {WAREHOUSE_TEXTS.services.filters.clear}
              </button>
              <button
                onClick={applySearch}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading
                  ? WAREHOUSE_TEXTS.services.filters.filtering
                  : WAREHOUSE_TEXTS.services.filters.apply}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla reutilizable */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<Service>
          columns={columns}
          data={servicesResponse?.data || []}
          keyField="id"
          loading={isLoading}
          pagination={{
            page: pagination.page,
            totalPages: servicesResponse?.totalPages || 0,
            onPageChange: handlePageChange,
          }}
          actions={actions}
          pageSize={pagination.pageSize}
        />
      </div>
    </div>
  );
};
