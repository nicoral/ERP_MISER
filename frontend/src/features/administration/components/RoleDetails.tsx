import React from 'react';
import { Disclosure } from '@headlessui/react';
import type { Role, Permission } from '../../../types/user';
import {
  EyeIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ChevronDownIcon,
} from '../../../components/common/Icons';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { MODULES } from '../../../config/constants';

const ACTIONS = [
  { key: 'view', label: 'Ver', icon: <EyeIcon className="w-5 h-5" /> },
  { key: 'create', label: 'Crear', icon: <PlusIcon className="w-5 h-5" /> },
  {
    key: 'update',
    label: 'Actualizar',
    icon: <EditIcon className="w-5 h-5" />,
  },
  { key: 'delete', label: 'Eliminar', icon: <TrashIcon className="w-5 h-5" /> },
];

function hasPermission(role: Role, module: string, action: string) {
  return role.permissions.some(
    (perm: Permission) =>
      perm.module?.toLowerCase() === module.toLowerCase() &&
      perm.name?.toLowerCase().includes(action.toLowerCase())
  );
}

const RoleDetails: React.FC<{ role: Role; loading?: boolean }> = ({
  role,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="space-y-2">
        {MODULES.map(module => {
          const enabledCount = ACTIONS.filter(action =>
            hasPermission(role, module.key, action.key)
          ).length;

          return (
            <Disclosure key={module.key} as="div">
              {({ open }) => (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <Disclosure.Button className="bg-white dark:bg-gray-900 flex justify-between items-center w-full px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75 rounded-lg">
                    <span>{module.label}</span>
                    <div className="flex items-center">
                      <span
                        className={`text-xs font-semibold mr-3 px-2 py-1 rounded-full ${
                          enabledCount === ACTIONS.length
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : enabledCount > 0
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {enabledCount} / {ACTIONS.length}
                      </span>
                      <ChevronDownIcon
                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-4 pt-2 pb-4 text-sm text-gray-500 border-t border-gray-200 dark:border-gray-700/50">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      {ACTIONS.map(action => (
                        <div
                          key={action.key}
                          className={`flex items-center p-2 rounded-md ${
                            hasPermission(role, module.key, action.key)
                              ? 'bg-green-100 dark:bg-green-800/60 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-800/60 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {hasPermission(role, module.key, action.key) ? (
                            <CheckBadgeIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                          )}
                          <span className="truncate">{action.label}</span>
                        </div>
                      ))}
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          );
        })}
      </div>
    </div>
  );
};

export default RoleDetails;
