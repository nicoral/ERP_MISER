import React from "react";
import { WAREHOUSE_TEXTS } from "../../../config/texts";
import { EyeIcon, EditIcon, TrashIcon } from "../../../components/common/Icons";

export const WarehouseList = () => {
  // Ejemplo de datos
  const warehouses = [
    { code: "ALM01", name: "Almacén Central", location: "Madrid", active: true },
    { code: "ALM02", name: "Almacén Norte", location: "Barcelona", active: false },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{WAREHOUSE_TEXTS.warehouses.title}</h2>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          {WAREHOUSE_TEXTS.warehouses.buttons.create}
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{WAREHOUSE_TEXTS.warehouses.table.columns.code}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{WAREHOUSE_TEXTS.warehouses.table.columns.name}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{WAREHOUSE_TEXTS.warehouses.table.columns.location}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{WAREHOUSE_TEXTS.warehouses.table.columns.status}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{WAREHOUSE_TEXTS.warehouses.table.columns.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {warehouses.map((wh) => (
              <tr key={wh.code}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{wh.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{wh.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{wh.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${wh.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {wh.active ? WAREHOUSE_TEXTS.warehouses.table.status.active : WAREHOUSE_TEXTS.warehouses.table.status.inactive}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button title={WAREHOUSE_TEXTS.warehouses.table.actions.view} className="p-2 rounded transition-colors hover:bg-blue-100 dark:hover:bg-blue-900 bg-transparent">
                    <EyeIcon className="w-5 h-5 text-green-600" />
                  </button>
                  <button title={WAREHOUSE_TEXTS.warehouses.table.actions.edit} className="p-2 rounded transition-colors hover:bg-blue-100 dark:hover:bg-blue-900 bg-transparent">
                    <EditIcon className="w-5 h-5 text-blue-600" />
                  </button>
                  <button title={WAREHOUSE_TEXTS.warehouses.table.actions.delete} className="p-2 rounded transition-colors hover:bg-red-100 dark:hover:bg-red-900 bg-transparent">
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