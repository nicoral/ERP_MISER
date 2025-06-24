import { useNavigate } from 'react-router-dom';
import { EMPLOYEES_TEXTS } from '../../../config/texts';
import { useEmployees, useDeleteEmployee } from '../hooks/useEmployees';
import type { Employee, EmployeeFilters } from '../../../types/employee';
import React, { useState } from 'react';
import {
  ChevronDownIcon,
  EditIcon,
  EyeIcon,
  TrashIcon,
  UploadIcon,
} from '../../../components/common/Icons';
import { FormInput } from '../../../components/common/FormInput';
import {
  Table,
  type TableAction,
  type TableColumn,
} from '../../../components/common/Table';
import { Modal } from '../../../components/common/Modal';
import { EmployeeDetails } from './EmployeeDetails';
import { ExcelImportModal } from './ExcelImportModal';
import { hasPermission } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';

export const EmployeeList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteEmployeeMutation = useDeleteEmployee();

  const [filters, setFilters] = useState<EmployeeFilters>({ search: '' });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  // Hook con datos y estados automáticos de React Query
  const { data, isLoading, isFetching, refetch } = useEmployees(
    page,
    10,
    filters
  );

  // Manejar cambios en los filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({ search: '' });
    setPage(1);
  };

  // Cambiar de página
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > (data?.totalPages ?? 1)) return;
    setPage(newPage);
  };

  const handleCreate = () => navigate('/employees/create');
  const handleEdit = (id: number) => navigate(`/employees/${id}/edit`);
  const handleImport = () => setShowImportModal(true);

  const handleDelete = async (employee: Employee) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar al empleado ${employee.firstName} ${employee.lastName}?`
      )
    ) {
      try {
        await deleteEmployeeMutation.mutateAsync(employee.id);
        showSuccess(
          'Eliminado',
          `Empleado ${employee.firstName} ${employee.lastName} eliminado correctamente`
        );
      } catch {
        showError('Error', 'No se pudo eliminar el empleado');
      }
    }
  };

  const handleImportSuccess = () => {
    refetch(); // Recargar la lista después de importar
  };

  // Columnas para la tabla de empleados
  const columns: TableColumn<Employee>[] = [
    {
      header: EMPLOYEES_TEXTS.table.columns.id,
      accessor: 'id',
    },
    {
      header: EMPLOYEES_TEXTS.table.columns.firstName,
      accessor: 'firstName',
      accessor2: 'lastName',
    },
    {
      header: EMPLOYEES_TEXTS.table.columns.email,
      accessor: 'email',
      isKey: false,
    },
    {
      header: EMPLOYEES_TEXTS.table.columns.area,
      accessor: 'area',
      isKey: true,
    },
    {
      header: EMPLOYEES_TEXTS.table.columns.position,
      accessor: 'position',
      isKey: false,
    },
    {
      header: EMPLOYEES_TEXTS.table.columns.phone,
      accessor: 'phone',
      isKey: false,
    },
    {
      header: EMPLOYEES_TEXTS.table.columns.status,
      accessor: 'active',
      render: (employee: Employee) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            employee.active
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {employee.active
            ? EMPLOYEES_TEXTS.table.status.active
            : EMPLOYEES_TEXTS.table.status.inactive}
        </span>
      ),
    },
  ];

  const actions: TableAction<Employee>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: EMPLOYEES_TEXTS.table.actions.view,
      onClick: (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowDetailsModal(true);
      },
    },
    ...(hasPermission('update_employee')
      ? [
          {
            icon: <EditIcon className="w-5 h-5 text-blue-600" />,
            label: EMPLOYEES_TEXTS.table.actions.edit,
            onClick: (employee: Employee) => handleEdit(employee.id),
          },
        ]
      : []),
    ...(hasPermission('delete_employee')
      ? [
          {
            icon: <TrashIcon className="w-5 h-5 text-red-600" />,
            label: 'Eliminar',
            onClick: (employee: Employee) => handleDelete(employee),
          },
        ]
      : []),
  ];

  return (
    <div className="sm:p-8 p-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {EMPLOYEES_TEXTS.title}
        </h2>
        {hasPermission('create_employee') && (
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 w-fit flex items-center gap-2"
            >
              <UploadIcon className="w-4 h-4" />
              Importar Excel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 w-fit"
            >
              {EMPLOYEES_TEXTS.buttons.create}
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex justify-between w-full text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md"
        >
          <span>{EMPLOYEES_TEXTS.filters.title}</span>
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`}
          />
        </button>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                id="search"
                name="search"
                label={EMPLOYEES_TEXTS.filters.search}
                value={filters.search}
                onChange={handleFilterChange}
                placeholder={EMPLOYEES_TEXTS.filters.searchPlaceholder}
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                {EMPLOYEES_TEXTS.filters.clear}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<Employee>
          columns={columns}
          data={data?.data ?? []}
          keyField="id"
          loading={isLoading || isFetching || deleteEmployeeMutation.isPending}
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
        title={`👤 ${selectedEmployee?.firstName ?? ''} ${selectedEmployee?.lastName ?? ''}`}
      >
        {selectedEmployee && <EmployeeDetails employee={selectedEmployee} />}
      </Modal>

      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};
