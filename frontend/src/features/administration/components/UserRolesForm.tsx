import { EditIcon, EyeIcon } from '../../../components/common/Icons';
import { ADMINISTRATION_TEXTS } from '../../../config/texts';
import type { Role } from '../../../types/user';
import { useRoles } from '../../employees/hooks/userRoles';
import type { TableAction, TableColumn } from '../../../types/table';
import { Table } from '../../../components/common/Table';
import { useEffect, useState } from 'react';
import { Modal } from '../../../components/common/Modal';
import RoleDetails from './RoleDetails';
import { usePermissionsByRole } from '../hooks/usePermissions';
import { ROUTES } from '../../../config/constants';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export const UserRolesForm = () => {
  const navigate = useNavigate();
  const { roles: initialRoles, loading, error } = useRoles();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const { permissions } = usePermissionsByRole(selectedRoleId);

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

  const columns: TableColumn<Role>[] = [
    { header: ADMINISTRATION_TEXTS.rolesForm.name, accessor: 'name' },
    {
      header: ADMINISTRATION_TEXTS.rolesForm.description,
      accessor: 'description',
    },
  ];

  const handleEdit = (role: Role) => {
    navigate(`${ROUTES.ROLES}/${role.id}`);
  };

  const handleView = (role: Role) => {
    setSelectedRole(role);
    setSelectedRoleId(role.id);
  };

  const actions: TableAction<Role>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: ADMINISTRATION_TEXTS.rolesForm.view,
      onClick: (role: Role) => handleView(role),
    },
    {
      icon: <EditIcon className="w-5 h-5 text-blue-600" />,
      label: ADMINISTRATION_TEXTS.rolesForm.edit,
      onClick: (role: Role) => handleEdit(role),
    },
  ];

  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {ADMINISTRATION_TEXTS.panels.roles.title}
        </h3>
        <button
          onClick={() => navigate(`${ROUTES.ROLES}`)}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {ADMINISTRATION_TEXTS.rolesForm.add}
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<Role>
          columns={columns}
          data={roles}
          keyField="id"
          actions={actions}
        />
      </div>
      <Modal
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        title=""
      >
        {selectedRole && (
          <RoleDetails role={{ ...selectedRole, permissions }} />
        )}
      </Modal>
    </div>
  );
};
