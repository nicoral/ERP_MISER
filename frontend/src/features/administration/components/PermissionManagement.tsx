import { useEffect, useState } from 'react';
import { usePermissionManagement } from '../hooks/usePermissionManagement';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import { Modal } from '../../../components/common/Modal';
import { FormInput } from '../../../components/common/FormInput';
import { FormSelect } from '../../../components/common/FormSelect';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
} from '../../../components/common/Icons';
import { useToast } from '../../../contexts/ToastContext';
import type { Permission } from '../../../types/permission';

interface CreatePermissionDto {
  name: string;
  module: string;
  endpoint: string;
  method: string;
  description: string;
}

export const PermissionManagement = () => {
  const { showSuccess, showError } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<CreatePermissionDto>({
    name: '',
    module: '',
    endpoint: '',
    method: 'GET',
    description: '',
  });

  const {
    permissions,
    loading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
  } = usePermissionManagement();

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const modules = [
    'auth',
    'employee',
    'warehouse',
    'article',
    'service',
    'requirement',
    'quotation',
    'purchase_order',
    'entry_part',
    'exit_part',
    'fuel_control',
    'administration',
    'advanced',
  ];

  const handleCreate = async () => {
    try {
      await createPermission(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        module: '',
        endpoint: '',
        method: 'GET',
        description: '',
      });
      showSuccess('Permiso creado exitosamente');
    } catch (error) {
      console.error(error);
      showError('Error al crear el permiso');
    }
  };

  const handleEdit = async () => {
    if (!selectedPermission) return;

    try {
      await updatePermission({
        id: selectedPermission.id,
        ...formData,
      });
      setShowEditModal(false);
      setSelectedPermission(null);
      setFormData({
        name: '',
        module: '',
        endpoint: '',
        method: 'GET',
        description: '',
      });
      showSuccess('Permiso actualizado exitosamente');
    } catch (error) {
      console.error(error);
      showError('Error al actualizar el permiso');
    }
  };

  const handleDelete = async (permission: Permission) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este permiso?')) {
      try {
        await deletePermission(permission.id);
        showSuccess('Permiso eliminado exitosamente');
      } catch (error) {
        console.error(error);
        showError('Error al eliminar el permiso');
      }
    }
  };

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormData({
      name: permission.name,
      module: permission.module || '',
      endpoint: permission.endpoint || '',
      method: permission.method || 'GET',
      description: permission.description || '',
    });
    setShowEditModal(true);
  };

  const handleInputChange = (
    field: keyof CreatePermissionDto,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const filtered = permissions.filter(permission =>
      permission.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPermissions(filtered);
  }, [permissions, searchQuery]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorBanner
          message="Error al cargar los permisos"
          onClose={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto p-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Permisos
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 flex items-center text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nuevo Permiso
        </button>
      </div>

      <div className="mb-4">
        <FormInput
          placeholder="Buscar permiso..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value as string)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Módulo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPermissions?.map(permission => (
                <tr key={permission.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {permission.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {permission.module || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {permission.endpoint || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {permission.method || 'GET'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {permission.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(permission)}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                        title="Editar"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(permission)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear permiso */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Permiso"
      >
        <div className="space-y-4">
          <FormInput
            label="Nombre del Permiso"
            name="name"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            placeholder="Ej: create_employee"
            required
          />
          <FormSelect
            label="Módulo"
            name="module"
            value={formData.module}
            onChange={e => handleInputChange('module', e.target.value)}
          >
            <option value="">Seleccionar módulo</option>
            {modules.map(module => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Endpoint"
            name="endpoint"
            value={formData.endpoint}
            onChange={e => handleInputChange('endpoint', e.target.value)}
            placeholder="Ej: /employees"
            required
          />
          <FormSelect
            label="Método HTTP"
            name="method"
            value={formData.method}
            onChange={e => handleInputChange('method', e.target.value)}
          >
            {httpMethods.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            placeholder="Descripción del permiso"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Crear
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para editar permiso */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Permiso"
      >
        <div className="space-y-4">
          <FormInput
            label="Nombre del Permiso"
            name="name"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            placeholder="Ej: create_employee"
            required
          />
          <FormSelect
            label="Módulo"
            name="module"
            value={formData.module}
            onChange={e => handleInputChange('module', e.target.value)}
          >
            <option value="">Seleccionar módulo</option>
            {modules.map(module => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Endpoint"
            name="endpoint"
            value={formData.endpoint}
            onChange={e => handleInputChange('endpoint', e.target.value)}
            placeholder="Ej: /employees"
            required
          />
          <FormSelect
            label="Método HTTP"
            name="method"
            value={formData.method}
            onChange={e => handleInputChange('method', e.target.value)}
          >
            {httpMethods.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            placeholder="Descripción del permiso"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Actualizar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
