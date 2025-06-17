import { useState } from 'react';
import { GeneralSettingsForm } from '../features/administration/components/GeneralSettingsForm';
import { UserRolesForm } from '../features/administration/components/UserRolesForm';
import { AuditLogForm } from '../features/administration/components/AuditLogForm';
import { ADMINISTRATION_TEXTS } from '../config/texts';

export const Administration = () => {
  const [selected, setSelected] = useState<'general' | 'users' | 'audit'>(
    'users'
  );

  return (
    <div className="space-y-6 sm:p-8 p-2">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        {ADMINISTRATION_TEXTS.title}
      </h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            type="button"
            className={`p-4 rounded-lg cursor-pointer text-left w-full ${selected === 'general' ? 'ring-2 ring-blue-500 bg-white dark:bg-gray-900' : 'bg-blue-50 dark:bg-blue-900/50'}`}
            onClick={() => setSelected('general')}
          >
            <h2 className="text-lg font-medium text-blue-900 dark:text-blue-100">
              {ADMINISTRATION_TEXTS.panels.general.title}
            </h2>
            <p className="mt-2 text-blue-700 dark:text-blue-300 hidden sm:block">
              {ADMINISTRATION_TEXTS.panels.general.description}
            </p>
          </button>
          <button
            type="button"
            className={`p-4 rounded-lg cursor-pointer text-left w-full ${selected === 'users' ? 'ring-2 ring-green-500 bg-white dark:bg-gray-900' : 'bg-green-50 dark:bg-green-900/50'}`}
            onClick={() => setSelected('users')}
          >
            <h2 className="text-lg font-medium text-green-900 dark:text-green-100">
              {ADMINISTRATION_TEXTS.panels.roles.title}
            </h2>
            <p className="mt-2 text-green-700 dark:text-green-300 hidden sm:block">
              {ADMINISTRATION_TEXTS.panels.roles.description}
            </p>
          </button>
          <button
            type="button"
            className={`p-4 rounded-lg cursor-pointer text-left w-full ${selected === 'audit' ? 'ring-2 ring-purple-500 bg-white dark:bg-gray-900' : 'bg-purple-50 dark:bg-purple-900/50'}`}
            onClick={() => setSelected('audit')}
          >
            <h2 className="text-lg font-medium text-purple-900 dark:text-purple-100">
              {ADMINISTRATION_TEXTS.panels.audit.title}
            </h2>
            <p className="mt-2 text-purple-700 dark:text-purple-300 hidden sm:block">
              {ADMINISTRATION_TEXTS.panels.audit.description}
            </p>
          </button>
        </div>
        {/* Formulario debajo */}
        {selected === 'general' && <GeneralSettingsForm />}
        {selected === 'users' && <UserRolesForm />}
        {selected === 'audit' && <AuditLogForm />}
      </div>
    </div>
  );
};
