import React, { useState, useEffect } from 'react';
import type { Permission } from '../../../types/user';
import { FormCheckbox } from '../../../components/common/FormCheckbox';
import { useNavigate, useParams } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { usePermissions } from '../hooks/usePermissions';
import { ADMINISTRATION_TEXTS, COMMON_TEXTS } from '../../../config/texts';
import { ROUTES } from '../../../config/constants';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

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

  const handlePermissionToggle = (permId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
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
      await new Promise(resolve => setTimeout(resolve, 10000));
      navigate(ROUTES.ADMINISTRATION);
    } catch {
      setError(ADMINISTRATION_TEXTS.rolesForm.error);
    } finally {
      setSaving(false);
    }
  };

  if (isEditing && (loading || saving)) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (isEditing && error) {
    return (
      <div className="p-8 text-center text-red-500 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing
            ? ADMINISTRATION_TEXTS.rolesForm.edit
            : ADMINISTRATION_TEXTS.rolesForm.create}
        </h2>
        <button
          onClick={() => navigate('/administration')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800"
        >
          ← {ADMINISTRATION_TEXTS.rolesForm.back}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-background text-text rounded-lg shadow-md p-6 max-w-2xl mx-auto space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
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
          <label className="block text-sm font-medium text-primary mb-1">
            {ADMINISTRATION_TEXTS.rolesForm.description}
          </label>
          <textarea
            className="input"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={ADMINISTRATION_TEXTS.rolesForm.description}
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            {ADMINISTRATION_TEXTS.rolesForm.permissions}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allPermissions.map((perm: Permission) => (
              <FormCheckbox
                key={perm.id}
                label={perm.description}
                checked={selectedPermissions.includes(perm.id)}
                onChange={() => handlePermissionToggle(perm.id)}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary bg-blue-600">
            {isEditing ? COMMON_TEXTS.update : COMMON_TEXTS.save}
          </button>
        </div>
      </form>
    </div>
  );
};
