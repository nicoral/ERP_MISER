import React, { useState } from 'react';
import type { Warehouse } from '../../../types/warehouse';
import { WAREHOUSE_TEXTS } from '../../../config/texts';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../components/ui/avatar';
import { useWarehouse } from '../hooks/useWarehouse';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../../components/common/ErrorBanner';

type Props = {
  warehouse: Warehouse;
};

export const WarehouseDetails: React.FC<Props> = ({ warehouse }) => {
  const {
    data: warehouseData,
    isLoading,
    error: errorWarehouse,
  } = useWarehouse(warehouse.id);

  const [error, setError] = useState<string | null>(
    errorWarehouse?.message ?? null
  );

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
      <div>
        <h3 className="text-lg font-semibold mb-2">Información General</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🏢 {WAREHOUSE_TEXTS.form.fields.name}:{' '}
              <span className="text-gray-900 dark:text-white">
                {warehouseData?.name}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📍 {WAREHOUSE_TEXTS.form.fields.address}:{' '}
              <span className="text-gray-900 dark:text-white">
                {warehouseData?.address}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💰 {WAREHOUSE_TEXTS.form.fields.valued}:{' '}
              <span className="text-gray-900 dark:text-white">
                {warehouseData?.valued}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">
          {WAREHOUSE_TEXTS.form.fields.employee}
        </h3>
        <div className="flex flex-col items-center space-y-4">
          <div>
            <Avatar className="w-32 h-32">
              <AvatarImage src={warehouseData?.manager.imageUrl} />
              <AvatarFallback>
                {warehouseData?.manager.firstName}
                {warehouseData?.manager.lastName}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                {warehouseData?.manager.firstName}{' '}
                {warehouseData?.manager.lastName}
              </h2>
              <p className="text-gray-500">{warehouseData?.manager.area}</p>
              <p className="text-gray-500">{warehouseData?.manager.position}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Fechas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📅 {WAREHOUSE_TEXTS.form.fields.hireDate}:{' '}
              <span className="text-gray-900 dark:text-white">
                {warehouseData?.hireDate
                  ? new Date(warehouseData.hireDate).toLocaleDateString()
                  : '-'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📅 {WAREHOUSE_TEXTS.form.fields.dismissalDate}:{' '}
              <span className="text-gray-900 dark:text-white">
                {warehouseData?.dismissalDate
                  ? new Date(warehouseData.dismissalDate).toLocaleDateString()
                  : '-'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Estado</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📶 {WAREHOUSE_TEXTS.form.fields.active}:{' '}
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  warehouseData?.active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {warehouseData
                  ? WAREHOUSE_TEXTS.warehouses.table.status.active
                  : WAREHOUSE_TEXTS.warehouses.table.status.inactive}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
