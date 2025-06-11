import { useNavigate } from 'react-router-dom';
import { EMPLOYEES_TEXTS } from '../../../config/texts';
import { useEmployees } from '../hooks/useEmployees';
import type { Employee } from '../../../types/employee';
import { useState, useEffect } from 'react';
import React from 'react';
import {
  ChevronDownIcon,
  EditIcon,
  EyeIcon,
} from '../../../components/common/Icons';
import { getEmployees } from '../../../services/api/employeeService';
import { FormInput } from '../../../components/common/FormInput';
import {
  Table,
  type TableAction,
  type TableColumn,
} from '../../../components/common/Table';
import { Modal } from '../../../components/common/Modal';
import { EmployeeDetails } from './EmployeeDetails';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export const EmployeeList = () => {
  const navigate = useNavigate();
  const { employees: initialEmployees, loading, error } = useEmployees();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
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

  // Sincronizar empleados cuando cambie el hook (por ejemplo, al cargar)
  useEffect(() => {
    if (initialEmployees) {
      setEmployees(initialEmployees.data);
      setPagination({
        page: initialEmployees.page,
        pageSize: initialEmployees.pageSize,
        total: initialEmployees.total,
        totalPages: initialEmployees.totalPages,
      });
    }
  }, [initialEmployees]);

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
    try {
      // Primero actualizamos la página a 1
      setPagination(prev => ({
        ...prev,
        page: 1,
      }));

      const response = await getEmployees(1, pagination.pageSize, filters);
      setEmployees(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages,
      }));
    } catch (error) {
      console.error('Error al filtrar empleados:', error);
    } finally {
      setIsFiltering(false);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({ search: '' });
    if (initialEmployees) {
      setEmployees(initialEmployees.data);
      setPagination({
        page: initialEmployees.page,
        pageSize: initialEmployees.pageSize,
        total: initialEmployees.total,
        totalPages: initialEmployees.totalPages,
      });
    }
  };

  // Cambiar de página
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setIsFiltering(true);
    try {
      // Si hay filtros activos, forzar página 1
      if (filters.search) {
        newPage = 1;
      }

      const response = await getEmployees(
        newPage,
        pagination.pageSize,
        filters
      );
      setEmployees(response.data);
      setPagination(prev => ({
        ...prev,
        page: newPage,
      }));
    } catch (error) {
      console.error('Error al cambiar de página:', error);
    } finally {
      setIsFiltering(false);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/employees/${id}/edit`);
  };

  // Columnas para la tabla de empleados
  const columns: TableColumn<Employee>[] = [
    {
      header: EMPLOYEES_TEXTS.table.columns.firstName,
      accessor: 'firstName',
      accessor2: 'lastName',
    },
    { header: EMPLOYEES_TEXTS.table.columns.email, accessor: 'email' },
    { header: EMPLOYEES_TEXTS.table.columns.position, accessor: 'position' },
    { header: EMPLOYEES_TEXTS.table.columns.phone, accessor: 'phone' },
    {
      header: EMPLOYEES_TEXTS.table.columns.status,
      render: (emp: Employee) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            emp.active
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {emp.active
            ? EMPLOYEES_TEXTS.table.status.active
            : EMPLOYEES_TEXTS.table.status.inactive}
        </span>
      ),
    },
  ];

  // Acciones para la tabla de empleados
  const actions: TableAction<Employee>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: EMPLOYEES_TEXTS.table.actions.view,
      onClick: (emp: Employee) => setSelectedEmployee(emp),
    },
    {
      icon: <EditIcon className="w-5 h-5 text-blue-600" />,
      label: EMPLOYEES_TEXTS.table.actions.edit,
      onClick: (emp: Employee) => handleEdit(emp.id),
    },
  ];

  if (loading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {EMPLOYEES_TEXTS.title}
        </h2>
        <button
          onClick={() => navigate('/employees/create')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {EMPLOYEES_TEXTS.buttons.create}
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-left text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 px-4 py-2 rounded-md"
        >
          <span className="font-medium text-base">
            {EMPLOYEES_TEXTS.filters.title}
          </span>
          <ChevronDownIcon
            className={`w-5 h-5 transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
              <button
                onClick={applyFilters}
                disabled={isFiltering}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isFiltering
                  ? EMPLOYEES_TEXTS.filters.filtering
                  : EMPLOYEES_TEXTS.filters.apply}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla reutilizable */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<Employee>
          columns={columns}
          data={employees}
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
      <Modal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title={
          selectedEmployee
            ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
            : ''
        }
      >
        {selectedEmployee && <EmployeeDetails employee={selectedEmployee} />}
      </Modal>
    </div>
  );
};
