import React, { useState, useEffect } from 'react';
import type { Permission } from '../../../types/user';
import { useNavigate, useParams } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { usePermissions } from '../hooks/usePermissions';
import { ADMINISTRATION_TEXTS, COMMON_TEXTS } from '../../../config/texts';
import { MODULES, ROUTES } from '../../../config/constants';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { FormSwitch } from '../../../components/common/FormSwitch';
import { createRole, updateRole } from '../../../services/api/roleService';
import { ErrorBanner } from '../../../components/common/ErrorBanner';

const ACTIONS = ['view', 'create', 'update', 'delete'];
const ACTION_LABELS: { [key: string]: string } = {
  view: 'Ver',
  create: 'Crear',
  update: 'Actualizar',
  delete: 'Eliminar',
};

export const RoleForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEditing = Boolean(params.id);
  const roleId = params.id ? Number(params.id) : undefined;
  const { role } = useRole(roleId);
  const { permissions: allPermissions, loading } = usePermissions();
  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    role?.permissions.map(p => p.id) ?? []
  );

  const findPermission = (
    moduleKey: string,
    actionKey: string
  ): Permission | undefined => {
    return allPermissions.find(
      p =>
        p.module?.toLowerCase() === moduleKey.toLowerCase() &&
        p.name?.toLowerCase().startsWith(actionKey.toLowerCase())
    );
  };

  const handlePermissionToggle = (permId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
  };

  const handleModuleToggle = (moduleKey: string, checked: boolean) => {
    const modulePermissions = ACTIONS.map(action =>
      findPermission(moduleKey, action)
    )
      .filter(p => p !== undefined)
      .map(p => p!.id);

    if (checked) {
      setSelectedPermissions(prev => [
        ...new Set([...prev, ...modulePermissions]),
      ]);
    } else {
      setSelectedPermissions(prev =>
        prev.filter(id => !modulePermissions.includes(id))
      );
    }
  };

  useEffect(() => {
    if (isEditing && role) {
      setName(role.name);
      setDescription(role.description);
      setSelectedPermissions(role.permissions.map(p => p.id));
    }
  }, [isEditing, role]);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // TODO: Implementar lógica de guardado
      console.log(ADMINISTRATION_TEXTS.rolesForm.saving, {
        name,
        description,
        permissions: selectedPermissions,
      });
      if (isEditing) {
        await updateRole(roleId!, {
          name,
          description,
          permissions: selectedPermissions,
        });
      } else {
        await createRole({
          name,
          description,
          permissions: selectedPermissions,
        });
      }
    } catch {
      setError(ADMINISTRATION_TEXTS.rolesForm.error);
    } finally {
      setSaving(false);
      navigate(ROUTES.ROLES);
    }
  };

  if (loading || saving) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing
            ? ADMINISTRATION_TEXTS.rolesForm.edit
            : ADMINISTRATION_TEXTS.rolesForm.create}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {ADMINISTRATION_TEXTS.rolesForm.name}
            </label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={ADMINISTRATION_TEXTS.rolesForm.name}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {ADMINISTRATION_TEXTS.rolesForm.description}
            </label>
            <input
              className="input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={ADMINISTRATION_TEXTS.rolesForm.description}
            />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {ADMINISTRATION_TEXTS.rolesForm.permissions}
          </h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Módulo
                  </th>
                  {ACTIONS.map(action => (
                    <th
                      key={action}
                      className="px-6 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {ACTION_LABELS[action]}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Todos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {MODULES.map(module => {
                  const modulePermissions = ACTIONS.map(action =>
                    findPermission(module.key, action)
                  ).filter(p => p !== undefined);
                  const enabledCount = modulePermissions.filter(p =>
                    selectedPermissions.includes(p!.id)
                  ).length;
                  const allSelected =
                    modulePermissions.length > 0 &&
                    enabledCount === modulePermissions.length;

                  return (
                    <tr
                      key={module.key}
                      className="dark:hover:bg-gray-700/40 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                        {module.label}
                      </td>
                      {ACTIONS.map(action => {
                        const permission = findPermission(module.key, action);
                        return (
                          <td
                            key={action}
                            className="px-6 py-4 whitespace-nowrap text-center"
                          >
                            <div className="flex justify-center">
                              {permission ? (
                                <FormSwitch
                                  checked={selectedPermissions.includes(
                                    permission.id
                                  )}
                                  onChange={() =>
                                    handlePermissionToggle(permission.id)
                                  }
                                />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                          <FormSwitch
                            checked={allSelected}
                            onChange={checked =>
                              handleModuleToggle(module.key, checked)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="button"
            className="btn btn-secondary bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 mr-4"
            onClick={() => navigate(ROUTES.ROLES)}
          >
            {ADMINISTRATION_TEXTS.rolesForm.back}
          </button>
          <button
            type="submit"
            className="btn btn-primary bg-blue-600 hover:bg-blue-700"
          >
            {isEditing ? COMMON_TEXTS.update : COMMON_TEXTS.save}
          </button>
        </div>
      </form>
    </div>
  );
};
