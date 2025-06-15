import React from 'react';
import type { Employee } from '../../../types/employee';
import { EMPLOYEES_TEXTS } from '../../../config/texts';
import defaultAvatar from '../../../assets/default-avatar.png';
import { useEmployee } from '../hooks/useEmployee';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

type Props = {
  employee: Employee;
};

export const EmployeeDetails: React.FC<Props> = ({ employee }) => {
  const { employee: employeeDetails, loading } = useEmployee(employee.id);
  if (loading) return <LoadingSpinner />;
  if (!employeeDetails) return <div>Empleado no encontrado</div>;
  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-6">
        <img
          src={employeeDetails.imageUrl || defaultAvatar}
          alt={`${employeeDetails.firstName} ${employeeDetails.lastName}`}
          className="w-32 h-32 rounded-full object-cover"
        />
      </div>

      {/* Información General */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Información General</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📧 {EMPLOYEES_TEXTS.form.fields.email}:{' '}
              <span className="text-gray-900 dark:text-white">
                {employeeDetails.email}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📞 {EMPLOYEES_TEXTS.form.fields.phone}:{' '}
              <span className="text-gray-900 dark:text-white">
                {employeeDetails.phone}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🏢 {EMPLOYEES_TEXTS.form.fields.area}:{' '}
              <span className="text-gray-900 dark:text-white">
                {employeeDetails.area}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🏷 {EMPLOYEES_TEXTS.form.fields.position}:{' '}
              <span className="text-gray-900 dark:text-white">
                {employeeDetails.position}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🆔 {EMPLOYEES_TEXTS.form.fields.documentId}:{' '}
              <span className="text-gray-900 dark:text-white">
                {employeeDetails.documentId}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🔤 {EMPLOYEES_TEXTS.form.fields.documentType}:{' '}
              <span className="text-gray-900 dark:text-white">
                {employeeDetails.documentType}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📅 {EMPLOYEES_TEXTS.form.fields.hireDate}:{' '}
              <span className="text-gray-900 dark:text-white">
                {employeeDetails.hireDate
                  ? new Date(employeeDetails.hireDate).toLocaleDateString()
                  : '-'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📅 {EMPLOYEES_TEXTS.form.fields.dischargeDate}:{' '}
              <span className="text-gray-900 dark:text-white">
                {employeeDetails.dischargeDate
                  ? new Date(employeeDetails.dischargeDate).toLocaleDateString()
                  : '-'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🏠 {EMPLOYEES_TEXTS.form.fields.address}:{' '}
              <span className="text-gray-900 dark:text-white">
                {employeeDetails.address}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🎂 {EMPLOYEES_TEXTS.form.fields.birthDate}:{' '}
              <span className="text-gray-900 dark:text-white">
                {employeeDetails.birthDate
                  ? new Date(employeeDetails.birthDate).toLocaleDateString()
                  : '-'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Almacenes Asignados */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Almacenes Asignados</h3>
        <div className="grid grid-cols-3 gap-2">
          {employeeDetails.warehousesAssigned.map(warehouse => (
            <div
              key={warehouse.id}
              className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-center"
            >
              <span className="text-sm text-gray-900 dark:text-white">
                📍{warehouse.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Información de Estado */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Información de Estado</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📶 {EMPLOYEES_TEXTS.form.fields.active}:{' '}
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  employeeDetails.active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {employeeDetails.active
                  ? EMPLOYEES_TEXTS.table.status.active
                  : EMPLOYEES_TEXTS.table.status.inactive}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
