import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import type { Role, Permission } from '../../../types/user';
import type { Employee, UpdateEmployee } from '../../../types/employee';
import {
  EyeIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ChevronDownIcon,
  SettingsIcon,
  EmployeesIcon,
  ChevronLeftIcon,
  RolesIcon,
} from '../../../components/common/Icons';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Modal } from '../../../components/common/Modal';
import { MODULES } from '../../../config/constants';
import { ROUTES } from '../../../config/constants';
import { useToast } from '../../../contexts/ToastContext';
import { hasPermission } from '../../../utils/permissions';
import { useRoles } from '../../employees/hooks/userRoles';
import { useUpdateEmployee } from '../../employees/hooks/useEmployees';
import defaultAvatar from '../../../assets/default-avatar.png';

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

interface RoleDetailsViewProps {
  role: Role;
  employees: Employee[];
  loading: boolean;
  onUpdateRole?: (roleId: number, employeeId: number) => void;
  onRefetch?: () => void;
}

const RoleDetailsView: React.FC<RoleDetailsViewProps> = ({
  role,
  employees,
  loading,
  onUpdateRole,
  onRefetch,
}) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'permissions' | 'users'>(
    'permissions'
  );

  // Hooks para roles y actualización de empleados
  const { roles: availableRoles, loading: loadingRoles } = useRoles();
  const updateEmployeeMutation = useUpdateEmployee();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  // Obtener permisos avanzados dinámicamente del rol
  const advancedPermissions = role.permissions.filter(
    p => p.module === 'advanced'
  );

  // Los empleados ya vienen filtrados del endpoint
  const roleEmployees = employees;

  const handleBack = () => {
    navigate(ROUTES.ROLES);
  };

  const handleEdit = () => {
    navigate(ROUTES.ROLE_EDIT.replace(':id', role.id.toString()));
  };

  const handleUpdateUserRole = async (
    newRoleId: number,
    employeeId: number
  ) => {
    try {
      console.log(employeeId, newRoleId);
      // Encontrar el empleado
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) {
        showError('Error', 'Empleado no encontrado');
        return;
      }

      // Encontrar el nuevo rol
      const newRole = availableRoles.find(r => r.id === newRoleId);
      if (!newRole) {
        showError('Error', 'Rol no encontrado');
        return;
      }

      // Actualizar el empleado usando el servicio existente
      // Solo enviamos los campos que se pueden actualizar
      const updateData = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        documentId: employee.documentId,
        documentType: employee.documentType,
        position: employee.position,
        phone: employee.phone,
        address: employee.address,
        area: employee.area,
        active: employee.active,
        role: newRoleId, // El backend manejará la actualización del rol
      };

      await updateEmployeeMutation.mutateAsync({
        id: employeeId,
        data: updateData as UpdateEmployee,
      });

      showSuccess(
        'Rol actualizado',
        `El rol de ${employee.firstName} ${employee.lastName} se actualizó correctamente a ${newRole.name}`
      );

      // Llamar al callback si existe
      if (onUpdateRole) {
        onUpdateRole(newRoleId, employeeId);
      }
      if (onRefetch) {
        onRefetch();
      }
    } catch (error) {
      console.error('Error updating employee role:', error);
      showError('Error', 'No se pudo actualizar el rol del empleado');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-transparent shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-transparent"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <RolesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {role.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Detalles del rol
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {hasPermission('update_roles') && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <EditIcon className="w-4 h-4 mr-2 inline" />
                  Editar Rol
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Description Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Descripción
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {role.description || 'Sin descripción disponible'}
          </p>
        </div>

        {/* Tabs enmarcados */}
        <div className="mb-6 w-full bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl p-2 shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-300 dark:border-gray-800 w-full">
            <nav className="-mb-px flex w-full">
              <div
                onClick={() => setActiveTab('permissions')}
                className={`flex-1 text-center cursor-pointer py-3 px-4 transition-all duration-200 rounded-t-lg
                  ${
                    activeTab === 'permissions'
                      ? 'bg-blue-100 dark:bg-blue-900 border-b-4 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-bold shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 border-b-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="truncate block flex items-center justify-center">
                  <RolesIcon className="w-4 h-4 mr-2" />
                  Permisos ({role.permissions.length})
                </span>
              </div>
              <div
                onClick={() => setActiveTab('users')}
                className={`flex-1 text-center cursor-pointer py-3 px-4 transition-all duration-200 rounded-t-lg
                  ${
                    activeTab === 'users'
                      ? 'bg-blue-100 dark:bg-blue-900 border-b-4 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-bold shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 border-b-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="truncate block flex items-center justify-center">
                  <EmployeesIcon className="w-4 h-4 mr-2" />
                  Usuarios ({roleEmployees.length})
                </span>
              </div>
            </nav>
          </div>

          {/* Contenido de los tabs */}
          <div className="bg-white dark:bg-gray-100/10 rounded-lg border border-gray-200 dark:border-gray-700 mt-4 p-6">
            {activeTab === 'permissions' ? (
              <PermissionsTab
                role={role}
                advancedPermissions={advancedPermissions}
              />
            ) : (
              <UsersTab
                employees={roleEmployees}
                availableRoles={availableRoles}
                loadingRoles={loadingRoles}
                onUpdateRole={handleUpdateUserRole}
                isUpdating={updateEmployeeMutation.isPending}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para la pestaña de permisos
const PermissionsTab: React.FC<{
  role: Role;
  advancedPermissions: Permission[];
}> = ({ role, advancedPermissions }) => {
  // Función local para verificar permisos del rol
  const checkRolePermission = (role: Role, module: string, action: string) => {
    return role.permissions.some(
      (perm: Permission) =>
        perm.module?.toLowerCase() === module.toLowerCase() &&
        perm.name?.toLowerCase().includes(action.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      {/* Permisos regulares */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Permisos del Sistema
        </h3>
        {MODULES.map(module => {
          const enabledCount = ACTIONS.filter(action =>
            checkRolePermission(role, module.key, action.key)
          ).length;

          return (
            <Disclosure key={module.key} as="div">
              {({ open }) => (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <Disclosure.Button className="bg-gray-50 dark:bg-gray-700 flex justify-between items-center w-full px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75 rounded-lg">
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
                  <Disclosure.Panel className="px-4 pt-2 pb-4 text-sm text-gray-500 border-t border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      {ACTIONS.map(action => (
                        <div
                          key={action.key}
                          className={`flex items-center p-2 rounded-md ${
                            checkRolePermission(role, module.key, action.key)
                              ? 'bg-green-100 dark:bg-green-800/60 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-800/60 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {checkRolePermission(role, module.key, action.key) ? (
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

      {/* Permisos avanzados */}
      {advancedPermissions.length > 0 && (
        <Disclosure
          as="div"
          className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
        >
          {({ open }) => (
            <>
              <Disclosure.Button className="w-full p-4 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <SettingsIcon className="w-5 h-5 mr-2 text-orange-500" />
                    Configuración Avanzada
                  </h3>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-orange-500 transform transition-transform duration-200 ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-2">
                  Estos permisos otorgan acceso a funciones avanzadas del
                  sistema.
                </p>
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pb-4 overflow-hidden transition-all duration-500 ease-out">
                <div className="space-y-2 mt-4">
                  {advancedPermissions.map(perm => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-green-100 dark:bg-green-800/60 border-green-200 dark:border-green-700 transform transition-all duration-300 ease-out hover:scale-105"
                    >
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {perm.name.replace('advanced.', '')}
                        </span>
                        {perm.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {perm.description}
                          </p>
                        )}
                      </div>
                      <CheckBadgeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  ))}
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )}
    </div>
  );
};

// Componente para la pestaña de usuarios
const UsersTab: React.FC<{
  employees: Employee[];
  availableRoles: Role[];
  loadingRoles: boolean;
  onUpdateRole: (roleId: number, employeeId: number) => Promise<void>;
  isUpdating: boolean;
}> = ({
  employees,
  availableRoles,
  loadingRoles,
  onUpdateRole,
  isUpdating,
}) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');

  const handleAssignRole = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowAssignModal(true);
  };

  const handleRoleChange = async (newRoleId: number) => {
    if (selectedEmployee) {
      try {
        await onUpdateRole(newRoleId, selectedEmployee.id);
        setShowAssignModal(false);
        setSelectedEmployee(null);
      } catch {
        // Error ya manejado en el componente padre
      }
    }
  };

  // Filtrar empleados basado en el término de búsqueda
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.id.toString().includes(searchLower) ||
      employee.firstName.toLowerCase().includes(searchLower) ||
      employee.lastName.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Usuarios con este rol
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filteredEmployees.length} de {employees.length} usuario
          {employees.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filtro de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por ID, nombre, apellido o email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm"
        />
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <EmployeesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm
              ? 'No se encontraron usuarios'
              : 'No hay usuarios asignados'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm
              ? 'No hay usuarios que coincidan con tu búsqueda.'
              : 'Este rol no tiene usuarios asignados actualmente.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                {filteredEmployees.map(employee => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={employee.imageUrl ?? defaultAvatar}
                            alt={employee.firstName}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {employee.position}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.area || 'Sin área'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {employee.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleAssignRole(employee)}
                        disabled={isUpdating}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? 'Actualizando...' : 'Cambiar Rol'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para cambiar rol */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Cambiar rol de ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`}
      >
        <div className="space-y-4">
          {loadingRoles ? (
            <div className="text-center py-4">
              <LoadingSpinner size="sm" className="text-blue-600" />
              <p className="text-sm text-gray-500 mt-2">Cargando roles...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableRoles
                .filter(
                  role =>
                    !selectedEmployee?.role ||
                    role.id !== selectedEmployee.role?.id
                )
                .map(role => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    disabled={isUpdating}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {role.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {role.description || 'Sin descripción'}
                    </div>
                  </button>
                ))}
            </div>
          )}

          {!loadingRoles &&
            availableRoles.filter(
              role =>
                !selectedEmployee?.role || role.id !== selectedEmployee.role?.id
            ).length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No hay otros roles disponibles para asignar
              </div>
            )}
        </div>
      </Modal>
    </div>
  );
};

export default RoleDetailsView;
