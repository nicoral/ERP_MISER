import React from 'react';
import type { Supplier } from '../../../types/supplier';
import { WAREHOUSE_TEXTS } from '../../../config/texts';
import { SupplierStatus } from '../../../types/supplier';

type Props = {
  supplier: Supplier;
};

export const SupplierDetails: React.FC<Props> = ({ supplier }) => {
  return (
    <div className="space-y-4">
      {/* Información General */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Información General</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🆔 {WAREHOUSE_TEXTS.suppliers.form.fields.ruc}:{' '}
              <span className="text-gray-900 dark:text-white">
                {supplier.ruc}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🏢 {WAREHOUSE_TEXTS.suppliers.form.fields.business_name}:{' '}
              <span className="text-gray-900 dark:text-white">
                {supplier.businessName}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              👤 {WAREHOUSE_TEXTS.suppliers.form.fields.contact_person}:{' '}
              <span className="text-gray-900 dark:text-white">
                {supplier.contactPerson}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📞 {WAREHOUSE_TEXTS.suppliers.form.fields.mobile}:{' '}
              <span className="text-gray-900 dark:text-white">
                {supplier.mobile}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📧 {WAREHOUSE_TEXTS.suppliers.form.fields.email}:{' '}
              <span className="text-gray-900 dark:text-white">
                {supplier.email || '-'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🏦 {WAREHOUSE_TEXTS.suppliers.form.fields.bank_account}:{' '}
              <span className="text-gray-900 dark:text-white">
                {supplier.bankAccount || '-'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📍 {WAREHOUSE_TEXTS.suppliers.form.fields.address}:{' '}
              <span className="text-gray-900 dark:text-white">
                {supplier.address || '-'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ⭐ {WAREHOUSE_TEXTS.suppliers.form.fields.rating}:{' '}
              <span className="text-gray-900 dark:text-white">
                {Math.round(supplier.rating)}/100
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Líneas de Productos */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Líneas de Productos</h3>
        <div className="grid grid-cols-3 gap-2">
          {supplier.lines.split('-').map((line, index) => (
            <div
              key={index}
              className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-center"
            >
              <span className="text-sm text-gray-900 dark:text-white">
                📦 {line}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Configuración */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Configuración</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📶 {WAREHOUSE_TEXTS.suppliers.form.fields.status}:{' '}
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  supplier.status === SupplierStatus.ACTIVE
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : supplier.status === SupplierStatus.INACTIVE
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}
              >
                {supplier.status === SupplierStatus.ACTIVE
                  ? WAREHOUSE_TEXTS.suppliers.table.status.active
                  : supplier.status === SupplierStatus.INACTIVE
                    ? WAREHOUSE_TEXTS.suppliers.table.status.inactive
                    : WAREHOUSE_TEXTS.suppliers.table.status.blacklisted}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🔄 {WAREHOUSE_TEXTS.suppliers.form.fields.return_policy}:{' '}
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  supplier.returnPolicy
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {supplier.returnPolicy ? 'Sí' : 'No'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
