import React from 'react';
import type { Role, Permission } from '../../../types/user';
import {
  EyeIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  CrossIcon,
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
    <div>
      <section>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                  Módulo
                </th>
                {ACTIONS.map(action => (
                  <th
                    key={action.key}
                    className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-center"
                  >
                    <div className="flex flex-col items-center">
                      {action.icon}
                      <span className="text-xs mt-1">{action.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map(module => (
                <tr
                  key={module.key}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                    {module.label}
                  </td>
                  {ACTIONS.map(action => (
                    <td key={action.key} className="px-4 py-2 text-center">
                      {hasPermission(role, module.key, action.key) ? (
                        <CheckIcon className="w-6 h-6 mx-auto" />
                      ) : (
                        <CrossIcon className="w-6 h-6 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default RoleDetails;
