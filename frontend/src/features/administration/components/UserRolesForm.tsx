import { EditIcon, EyeIcon, TrashIcon } from '../../../components/common/Icons';
import { ADMINISTRATION_TEXTS } from '../../../config/texts';
import type { Role } from '../../../types/user';
import { useRoles } from '../../employees/hooks/userRoles';
import { useEffect, useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import RoleDetails from './RoleDetails';
import { usePermissionsByRole } from '../hooks/usePermissions';
import { ROUTES } from '../../../config/constants';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { hasPermission } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';

export const UserRolesForm = () => {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const { roles: initialRoles, loading, error } = useRoles();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const { permissions, loading: loadingPermissions } =
    usePermissionsByRole(selectedRoleId);

  useEffect(() => {
    if (initialRoles) {
      setRoles(initialRoles);
    }
  }, [initialRoles]);

  if (loading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const handleView = (role: Role) => {
    setSelectedRole(role);
    setSelectedRoleId(role.id);
  };

  const handleEdit = (e: React.MouseEvent, role: Role) => {
    e.stopPropagation();
    navigate(`${ROUTES.ROLE_EDIT.replace(':id', role.id.toString())}`);
  };

  const handleDelete = (e: React.MouseEvent, role: Role) => {
    e.stopPropagation();
    console.log('Eliminar rol:', role);
    showSuccess('Eliminado', `Rol ${role.name} eliminado correctamente`);
  };

  return (
    <div className="mt-6">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {ADMINISTRATION_TEXTS.panels.roles.title}
        </h3>
        {hasPermission('create_roles') && (
          <button
            onClick={() => navigate(`${ROUTES.ROLE_CREATE}`)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {ADMINISTRATION_TEXTS.rolesForm.add}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <div
            key={role.id}
            onClick={() => handleView(role)}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            {/* Action buttons in top right corner */}
            <div className="absolute top-3 right-3 flex space-x-1 z-10">
              {hasPermission('update_roles') && (
                <button
                  onClick={e => handleEdit(e, role)}
                  className="bg-transparent p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  title={ADMINISTRATION_TEXTS.rolesForm.edit}
                >
                  <EditIcon className="w-4 h-4" />
                </button>
              )}
              {hasPermission('delete_roles') && (
                <button
                  onClick={e => handleDelete(e, role)}
                  className="bg-transparent p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                  title="Eliminar"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Card content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {role.name[0].toUpperCase() + role.name.slice(1)}
                </h4>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                {role.description || 'Sin descripción'}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {role.id}
                </span>
                <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Ver detalles
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for role details */}
      <Modal
        title={
          selectedRole
            ? selectedRole.name[0].toUpperCase() + selectedRole.name.slice(1)
            : ''
        }
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
      >
        {selectedRole && (
          <RoleDetails
            role={{ ...selectedRole, permissions }}
            loading={loadingPermissions}
          />
        )}
      </Modal>
    </div>
  );
};
