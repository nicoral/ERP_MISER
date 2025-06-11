import React, { useEffect, useState } from 'react';
import { WAREHOUSE_TEXTS } from '../../../config/texts';
import { EyeIcon, EditIcon, TrashIcon } from '../../../components/common/Icons';
import { getWarehouses } from '../../../services/api/warehouseService';
import { FormInput } from '../../../components/common/FormInput';
import {
  Table,
  type TableAction,
  type TableColumn,
} from '../../../components/common/Table';
import type { Warehouse } from '../../../types/warehouse';
import { useNavigate } from 'react-router-dom';

export const WarehouseList = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Cargar almacenes iniciales
  useEffect(() => {
    (async () => {
      setIsFiltering(true);
      const response = await getWarehouses(1, pagination.pageSize);
      setWarehouses(response.data);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages,
      });
      setIsFiltering(false);
    })();
    // eslint-disable-next-line
  }, []);

  // Manejar cambios en los filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Aplicar filtros
  const applyFilters = async () => {
    setIsFiltering(true);
    setPagination(prev => ({ ...prev, page: 1 }));
    const response = await getWarehouses(1, pagination.pageSize, filters);
    setWarehouses(response.data);
    setPagination(prev => ({
      ...prev,
      total: response.total,
      totalPages: response.totalPages,
    }));
    setIsFiltering(false);
  };

  // Limpiar filtros
  const clearFilters = async () => {
    setFilters({ search: '' });
    setIsFiltering(true);
    const response = await getWarehouses(1, pagination.pageSize);
    setWarehouses(response.data);
    setPagination({
      page: response.page,
      pageSize: response.pageSize,
      total: response.total,
      totalPages: response.totalPages,
    });
    setIsFiltering(false);
  };

  // Cambiar de página
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setIsFiltering(true);
    // Si hay filtros activos, forzar página 1
    if (filters.search) {
      newPage = 1;
    }
    const response = await getWarehouses(newPage, pagination.pageSize, filters);
    setWarehouses(response.data);
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
    setIsFiltering(false);
  };

  // Columnas para la tabla de almacenes
  const columns: TableColumn<Warehouse>[] = [
    { header: WAREHOUSE_TEXTS.warehouses.table.columns.name, accessor: 'name' },
    {
      header: WAREHOUSE_TEXTS.warehouses.table.columns.address,
      accessor: 'address',
    },
    {
      header: WAREHOUSE_TEXTS.warehouses.table.columns.employee,
      accessor: 'employee.firstName',
      accessor2: 'employee.lastName',
    },
    {
      header: WAREHOUSE_TEXTS.warehouses.table.columns.hireDate,
      accessor: 'hireDate',
    },
    {
      header: WAREHOUSE_TEXTS.warehouses.table.columns.dismissalDate,
      accessor: 'dismissalDate',
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

  const handleCreate = () => {
    navigate(`/warehouse/create`);
  };

  const handleEdit = (id: number) => {
    navigate(`/warehouse/${id}/edit`);
  };

  // Acciones para la tabla de almacenes
  const actions: TableAction<Warehouse>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: WAREHOUSE_TEXTS.warehouses.table.actions.view,
      onClick: () => {},
    },
    {
      icon: <EditIcon className="w-5 h-5 text-blue-600" />,
      label: WAREHOUSE_TEXTS.warehouses.table.actions.edit,
      onClick: (warehouse: Warehouse) => handleEdit(warehouse.id),
    },
    {
      icon: <TrashIcon className="w-5 h-5 text-red-600" />,
      label: WAREHOUSE_TEXTS.warehouses.table.actions.delete,
      onClick: () => {},
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {WAREHOUSE_TEXTS.warehouses.title}
        </h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {WAREHOUSE_TEXTS.warehouses.buttons.create}
        </button>
      </div>
      {/* Filtros colapsables */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-left text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 px-4 py-2 rounded-md"
        >
          <span className="font-medium text-base">
            {WAREHOUSE_TEXTS.warehouses.filters.title}
          </span>
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
              <button
                onClick={applyFilters}
                disabled={isFiltering}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isFiltering
                  ? WAREHOUSE_TEXTS.warehouses.filters.filtering
                  : WAREHOUSE_TEXTS.warehouses.filters.apply}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Tabla reutilizable */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<Warehouse>
          columns={columns}
          data={warehouses}
          keyField="id"
          loading={isFiltering}
          pagination={{
            page: pagination.page,
            totalPages: pagination.totalPages,
            onPageChange: (newPage: number) => handlePageChange(newPage),
          }}
          actions={actions}
          pageSize={pagination.pageSize}
        />
      </div>
    </div>
  );
};
