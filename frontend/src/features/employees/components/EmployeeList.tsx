import { useNavigate } from 'react-router-dom';
import { EMPLOYEES_TEXTS } from '../../../config/texts';
import { useEmployees } from '../hooks/useEmployees';
import type { Employee } from '../../../types/employee';
import { useState } from 'react';
import React from 'react';
import { TrashIcon } from '../../../components/common/Icons';

export const EmployeeList = () => {
  const navigate = useNavigate();
  const { employees: initialEmployees, loading, error } = useEmployees();
  const [employees, setEmployees] = useState(initialEmployees);

  // Sincronizar empleados cuando cambie el hook (por ejemplo, al cargar)
  React.useEffect(() => {
    setEmployees(initialEmployees);
  }, [initialEmployees]);

  const handleEdit = (id: number) => {
    navigate(`/employees/${id}/edit`);
  };

  const handleDelete = (id: number) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">{EMPLOYEES_TEXTS.loading}</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{EMPLOYEES_TEXTS.title}</h2>
        <button
          onClick={() => navigate('/employees/create')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {EMPLOYEES_TEXTS.buttons.create}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {EMPLOYEES_TEXTS.table.columns.firstName}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {EMPLOYEES_TEXTS.table.columns.lastName}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {EMPLOYEES_TEXTS.table.columns.position}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {EMPLOYEES_TEXTS.table.columns.phone}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {EMPLOYEES_TEXTS.table.columns.role}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {EMPLOYEES_TEXTS.table.columns.status}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {EMPLOYEES_TEXTS.table.columns.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {employees.map((emp: Employee) => (
              <tr key={emp.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{emp.firstName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{emp.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{emp.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{emp.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{emp.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    emp.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {emp.active ? EMPLOYEES_TEXTS.table.status.active : EMPLOYEES_TEXTS.table.status.inactive}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button
                    onClick={() => handleEdit(emp.id)}
                    title={EMPLOYEES_TEXTS.table.actions.edit}
                    className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.94l-4.243 1.415 1.415-4.243a4 4 0 01.94-1.414z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {/* TODO: Implementar bloqueo/desbloqueo */}}
                    title={emp.active ? EMPLOYEES_TEXTS.table.actions.block : EMPLOYEES_TEXTS.table.actions.unblock}
                    className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  >
                    {emp.active ? (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(EMPLOYEES_TEXTS.table.actions.confirmDelete)) {
                        handleDelete(emp.id);
                      }
                    }}
                    title={EMPLOYEES_TEXTS.table.actions.delete}
                    className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 