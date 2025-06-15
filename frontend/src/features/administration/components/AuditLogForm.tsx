import { FormSelect } from '../../../components/common/FormSelect';
import { FormInputDate } from '../../../components/common/FormInputDate';
import { ADMINISTRATION_TEXTS } from '../../../config/texts';

export const AuditLogForm = () => (
  <div className="mt-6">
    <form className="flex flex-wrap gap-4 mb-4">
      <FormSelect label={ADMINISTRATION_TEXTS.audit.user}>
        <option>Todos</option>
        <option>Juan Pérez</option>
      </FormSelect>
      <FormInputDate label={ADMINISTRATION_TEXTS.audit.date} />
      <FormSelect label={ADMINISTRATION_TEXTS.audit.action}>
        <option>Todos</option>
        <option>Login</option>
        <option>Edición</option>
        <option>Eliminación</option>
      </FormSelect>
      <button
        type="button"
        className="self-end px-4 py-2 bg-blue-600 text-white rounded"
      >
        {ADMINISTRATION_TEXTS.audit.filter}
      </button>
      <button
        type="button"
        className="self-end px-4 py-2 bg-gray-600 text-white rounded"
      >
        {ADMINISTRATION_TEXTS.audit.export}
      </button>
    </form>
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {ADMINISTRATION_TEXTS.audit.columns.datetime}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {ADMINISTRATION_TEXTS.audit.columns.user}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {ADMINISTRATION_TEXTS.audit.columns.action}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {ADMINISTRATION_TEXTS.audit.columns.detail}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              2024-06-01 10:00
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              Juan Pérez
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              Login
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              Inicio de sesión exitoso
            </td>
          </tr>
          {/* Más filas de ejemplo */}
        </tbody>
      </table>
    </div>
  </div>
);
