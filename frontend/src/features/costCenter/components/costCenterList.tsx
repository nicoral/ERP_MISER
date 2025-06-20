import { useEffect, useState } from 'react';
import {
  getCostCenters,
  deleteCostCenter,
} from '../../../services/api/costCenterService';
import type { CostCenter } from '../../../types/costCenter';
import type { TableAction, TableColumn } from '../../../types/table';
import { COST_CENTER_TEXTS } from '../../../config/texts';
import { EditIcon, TrashIcon } from '../../../components/common/Icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { FormInput } from '../../../components/common/FormInput';
import { Table } from '../../../components/common/Table';
import { hasPermission } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';

export const CostCenterList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    name: '',
    description: '',
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCostCenters = async () => {
      setIsLoading(true);
      try {
        const response = await getCostCenters(
          pagination.page,
          pagination.pageSize,
          filters.name
        );
        setCostCenters(response.data);
        setPagination(response);
      } catch (error) {
        console.error('Error al cargar centros de costo:', error);
        showError('Error', 'No se pudieron cargar los centros de costo');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCostCenters();
  }, []);

  const columns: TableColumn<CostCenter>[] = [
    { header: COST_CENTER_TEXTS.table.columns.id, accessor: 'id' },
    {
      header: COST_CENTER_TEXTS.table.columns.name,
      accessor: 'name',
    },
    {
      header: COST_CENTER_TEXTS.table.columns.description,
      accessor: 'description',
    },
  ];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ name: '', description: '' });
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  const applyFilters = async () => {
    setIsFiltering(true);
    try {
      const response = await getCostCenters(
        pagination.page,
        pagination.pageSize,
        filters.name
      );
      setCostCenters(response.data);
      setPagination(response);
    } catch (error) {
      console.error('Error al filtrar centros de costo:', error);
      showError('Error', 'No se pudieron aplicar los filtros');
    } finally {
      setIsFiltering(false);
    }
  };

  const handleDelete = async (costCenter: CostCenter) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el centro de costo ${costCenter.name}?`
      )
    ) {
      try {
        setIsDeleting(true);
        await deleteCostCenter(costCenter.id);
        showSuccess(
          'Eliminado',
          `Centro de costo ${costCenter.name} eliminado correctamente`
        );
        // Recargar la lista
        const response = await getCostCenters(
          pagination.page,
          pagination.pageSize,
          filters.name
        );
        setCostCenters(response.data);
        setPagination(response);
      } catch {
        showError('Error', 'No se pudo eliminar el centro de costo');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const actions: TableAction<CostCenter>[] = [
    ...(hasPermission('update_cost_centers')
      ? [
          {
            icon: <EditIcon className="w-5 h-5 text-blue-600" />,
            label: COST_CENTER_TEXTS.table.actions.edit,
            onClick: (costCenter: CostCenter) => {
              navigate(
                ROUTES.COST_CENTER_EDIT.replace(':id', costCenter.id.toString())
              );
            },
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
          {COST_CENTER_TEXTS.title}
        </h2>
        {hasPermission('create_cost_centers') && (
          <button
            onClick={() => navigate(ROUTES.COST_CENTER_CREATE)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-fit"
          >
            {COST_CENTER_TEXTS.buttons.create}
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
            {COST_CENTER_TEXTS.filters.title}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                id="search"
                name="search"
                label={COST_CENTER_TEXTS.filters.name}
                value={filters.name}
                onChange={handleFilterChange}
                placeholder={COST_CENTER_TEXTS.filters.search}
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                {COST_CENTER_TEXTS.filters.clear}
              </button>
              <button
                onClick={applyFilters}
                disabled={isFiltering}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isFiltering
                  ? COST_CENTER_TEXTS.filters.filtering
                  : COST_CENTER_TEXTS.filters.apply}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Tabla reutilizable */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<CostCenter>
          columns={columns}
          data={costCenters}
          keyField="id"
          loading={isLoading || isDeleting}
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
