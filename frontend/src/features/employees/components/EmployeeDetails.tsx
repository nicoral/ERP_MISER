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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.firstName}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {employeeDetails.firstName}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.lastName}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {employeeDetails.lastName}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.email}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {employeeDetails.email}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.phone}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {employeeDetails.phone}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.position}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {employeeDetails.position}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.documentId}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {employeeDetails.documentId}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.documentType}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {employeeDetails.documentType}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.hireDate}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {new Date(employeeDetails.hireDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.dischargeDate}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {employeeDetails.dischargeDate
              ? new Date(employeeDetails.dischargeDate).toLocaleDateString()
              : '-'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.address}
          </p>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {employeeDetails.address}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.warehousesAssigned}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {employeeDetails.warehousesAssigned.map(warehouse => (
              <div
                key={warehouse.id}
                className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-center"
              >
                <p className="text-sm text-gray-900 dark:text-white">
                  {warehouse.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {EMPLOYEES_TEXTS.form.fields.active}
          </p>
          <p className="mt-1">
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
  );
};
