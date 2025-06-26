import { useEffect, useState } from 'react';
import { FormSelect } from '../../../components/common/FormSelect';
import { FormInputDate } from '../../../components/common/FormInputDate';
import { ADMINISTRATION_TEXTS } from '../../../config/texts';
import { getAuditLogs } from '../../../services/api/auditLog.service';
import type { AuditLog, AuditLogFilters } from '../../../types/auditLog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, type TableColumn } from '../../../components/common/Table';
import { useEmployeesSimple } from '../../../hooks/useEmployeeService';
import { SearchableSelect } from '../../../components/common/SearchableSelect';

export const AuditLogForm = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const { data: employees, isLoading: loadingEmployees } =
    useEmployeesSimple('');

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await getAuditLogs(
          pagination.page,
          pagination.pageSize,
          filters
        );
        setAuditLogs(response.data);
        setPagination({
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [filters, pagination.page, pagination.pageSize]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value === 'Todos' ? undefined : value,
    }));
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setIsLoading(true);
    try {
      const response = await getAuditLogs(
        newPage,
        pagination.pageSize,
        filters
      );
      setAuditLogs(response.data);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: TableColumn<AuditLog>[] = [
    {
      header: ADMINISTRATION_TEXTS.audit.columns.datetime,
      render: (log: AuditLog) =>
        format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', {
          locale: es,
        }),
    },
    {
      header: ADMINISTRATION_TEXTS.audit.columns.user,
      render: (log: AuditLog) =>
        `${log.employee?.firstName ?? '-'} ${log.employee?.lastName ?? '-'}`,
    },
    {
      header: ADMINISTRATION_TEXTS.audit.columns.action,
      render: (log: AuditLog) => {
        switch (log.action) {
          case 'post':
            return 'Creación';
          case 'put':
            return 'Actualización';
          case 'delete':
            return 'Eliminación';
          case 'login':
            return 'Inicio de sesión';
          default:
            return log.action;
        }
      },
    },
    {
      header: ADMINISTRATION_TEXTS.audit.columns.detail,
      render: (log: AuditLog) => {
        if (!log.details) return '-';

        // Si hay cambios específicos, mostrarlos en un formato más legible
        if (log.details.includes(':')) {
          const [baseDescription, changes] = log.details.split(':');
          return (
            <div className="space-y-1">
              <div className="font-medium">{baseDescription}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {changes.split(',').map((change, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-blue-600 dark:text-blue-400">→</span>
                    <span>{change.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return log.details + (log.entityId ? ` (ID: ${log.entityId})` : '');
      },
    },
  ];

  // Preparar las opciones para el SearchableSelect
  const employeeOptions =
    employees?.map(employee => ({
      value: employee.id,
      label: `${employee.firstName} ${employee.lastName}`,
    })) || [];

  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {ADMINISTRATION_TEXTS.audit.title}
        </h3>
      </div>
      <form className="flex flex-wrap gap-4 mb-4 grid grid-cols-5">
        <SearchableSelect
          id="user"
          name="user"
          value={filters.userId || 'Todos'}
          label={ADMINISTRATION_TEXTS.audit.user}
          onChange={e => handleFilterChange('userId', e.target.value)}
          options={employeeOptions}
        />
        <FormInputDate
          label={ADMINISTRATION_TEXTS.audit.date}
          onChange={e => handleFilterChange('date', e.target.value)}
        />
        <FormSelect
          label={ADMINISTRATION_TEXTS.audit.action}
          onChange={e => handleFilterChange('search', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="post">Creación</option>
          <option value="put">Actualización</option>
          <option value="delete">Eliminación</option>
          <option value="login">Inicio de sesión</option>
        </FormSelect>
        {/* <button
          type="button"
          onClick={() => {}}
          className="self-end px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading || loadingEmployees
            ? 'Cargando...'
            : ADMINISTRATION_TEXTS.audit.filter}
        </button> */}
        {/* <button
          type="button"
          onClick={handleExport}
          className="self-end px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          {ADMINISTRATION_TEXTS.audit.export}
        </button> */}
      </form>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<AuditLog>
          columns={columns}
          data={auditLogs}
          keyField="id"
          loading={isLoading || loadingEmployees}
          pagination={{
            page: pagination.page,
            totalPages: pagination.totalPages,
            onPageChange: (newPage: number) => handlePageChange(newPage),
          }}
          pageSize={pagination.pageSize}
        />
      </div>
    </div>
  );
};
