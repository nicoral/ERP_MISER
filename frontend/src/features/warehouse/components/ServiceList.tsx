import React from "react";
import { WAREHOUSE_TEXTS } from "../../../config/texts";
import { EyeIcon, EditIcon, TrashIcon } from "../../../components/common/Icons";

export const ServiceList = () => {
  // Ejemplo de datos
  const services = [
    { code: "S001", name: "Servicio 1", type: "Tipo A", price: 100, active: true },
    { code: "S002", name: "Servicio 2", type: "Tipo B", price: 200, active: false },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{WAREHOUSE_TEXTS.services.title}</h2>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          {WAREHOUSE_TEXTS.services.buttons.create}
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{WAREHOUSE_TEXTS.services.table.columns.code}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{WAREHOUSE_TEXTS.services.table.columns.name}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{WAREHOUSE_TEXTS.services.table.columns.type}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{WAREHOUSE_TEXTS.services.table.columns.price}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{WAREHOUSE_TEXTS.services.table.columns.status}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{WAREHOUSE_TEXTS.services.table.columns.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {services.map((srv) => (
              <tr key={srv.code}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{srv.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{srv.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{srv.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${srv.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${srv.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {srv.active ? WAREHOUSE_TEXTS.services.table.status.active : WAREHOUSE_TEXTS.services.table.status.inactive}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button title={WAREHOUSE_TEXTS.services.table.actions.view} className="p-2 rounded transition-colors hover:bg-blue-100 dark:hover:bg-blue-900 bg-transparent">
                    <EyeIcon className="w-5 h-5 text-green-600" />
                  </button>
                  <button title={WAREHOUSE_TEXTS.services.table.actions.edit} className="p-2 rounded transition-colors hover:bg-blue-100 dark:hover:bg-blue-900 bg-transparent">
                    <EditIcon className="w-5 h-5 text-blue-600" />
                  </button>
                  <button title={WAREHOUSE_TEXTS.services.table.actions.delete} className="p-2 rounded transition-colors hover:bg-red-100 dark:hover:bg-red-900 bg-transparent">
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