import { useState } from 'react';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import { Modal } from '../../../components/common/Modal';
import { FormInput } from '../../../components/common/FormInput';
import { FormSelect } from '../../../components/common/FormSelect';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
} from '../../../components/common/Icons';
import { useToast } from '../../../contexts/ToastContext';
import { useSignatureConfiguration } from '../hooks/useSignatureConfiguration';

interface SignatureConfiguration {
  id: number;
  entityType: string;
  entityId: number;
  signatureLevel: number;
  roleName: string;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApprovalFlowTemplate {
  id: number;
  templateName: string;
  entityType: string;
  signatureLevel: number;
  roleName: string;
  isRequired: boolean;
  description?: string;
}

interface CreateSignatureConfigurationDto {
  entityType: string;
  entityId: number;
  signatureLevel: number;
  roleName: string;
  isRequired: boolean;
}

interface CreateTemplateDto {
  templateName: string;
  entityType: string;
  signatureLevel: number;
  roleName: string;
  isRequired: boolean;
  description?: string;
}

interface ApplyTemplateDto {
  entityType: string;
  entityId: number;
  templateName: string;
}

export const SignatureConfiguration = () => {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'configurations' | 'templates'>(
    'configurations'
  );
  const [showCreateConfigModal, setShowCreateConfigModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditConfigModal, setShowEditConfigModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [showApplyTemplateModal, setShowApplyTemplateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    SignatureConfiguration | ApprovalFlowTemplate | null
  >(null);
  const [editingItem, setEditingItem] = useState<
    SignatureConfiguration | ApprovalFlowTemplate | null
  >(null);
  const [applyTemplateData, setApplyTemplateData] = useState<ApplyTemplateDto>({
    entityType: '',
    entityId: 0,
    templateName: '',
  });

  const {
    configurations,
    templates,
    groupedTemplates,
    loading,
    error,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
    toggleConfigurationStatus,
  } = useSignatureConfiguration();

  const [formData, setFormData] = useState<CreateSignatureConfigurationDto>({
    entityType: '',
    entityId: 0,
    signatureLevel: 1,
    roleName: '',
    isRequired: true,
  });

  const [templateFormData, setTemplateFormData] = useState<CreateTemplateDto>({
    templateName: '',
    entityType: '',
    signatureLevel: 1,
    roleName: '',
    isRequired: true,
    description: '',
  });

  const entityTypes = [
    'requirement',
    'quotation',
    'purchase_order',
    'fuel_control',
    'entry_part',
    'exit_part',
  ];

  const signatureRoles = [
    'SOLICITANTE',
    'OFICINA_TECNICA',
    'ADMINISTRACION',
    'GERENCIA',
  ];

  const signatureLevels = [1, 2, 3, 4];

  const handleCreateConfiguration = async () => {
    try {
      await createConfiguration(formData);
      setShowCreateConfigModal(false);
      setFormData({
        entityType: '',
        entityId: 0,
        signatureLevel: 1,
        roleName: '',
        isRequired: true,
      });
      showSuccess('Configuración creada exitosamente');
    } catch (error) {
      console.error(error);
      showError('Error al crear la configuración');
    }
  };

  const handleCreateTemplate = async () => {
    try {
      await createTemplate(templateFormData);
      setShowCreateTemplateModal(false);
      setTemplateFormData({
        templateName: '',
        entityType: '',
        signatureLevel: 1,
        roleName: '',
        isRequired: true,
        description: '',
      });
      showSuccess('Plantilla creada exitosamente');
    } catch (error) {
      console.error(error);
      showError('Error al crear la plantilla');
    }
  };

  const handleEditConfiguration = async () => {
    if (!editingItem || !('entityId' in editingItem)) return;

    try {
      await updateConfiguration(editingItem.id, {
        entityType: editingItem.entityType,
        entityId: editingItem.entityId,
        signatureLevel: editingItem.signatureLevel,
        roleName: editingItem.roleName,
        isRequired: editingItem.isRequired,
      });
      setShowEditConfigModal(false);
      setEditingItem(null);
      showSuccess('Configuración actualizada exitosamente');
    } catch (error) {
      console.error(error);
      showError('Error al actualizar la configuración');
    }
  };

  const handleEditTemplate = async () => {
    if (!editingItem || !('templateName' in editingItem)) return;

    try {
      await updateTemplate(editingItem.id, {
        templateName: editingItem.templateName,
        entityType: editingItem.entityType,
        signatureLevel: editingItem.signatureLevel,
        roleName: editingItem.roleName,
        isRequired: editingItem.isRequired,
        description: editingItem.description,
      });
      setShowEditTemplateModal(false);
      setEditingItem(null);
      showSuccess('Plantilla actualizada exitosamente');
    } catch (error) {
      console.error(error);
      showError('Error al actualizar la plantilla');
    }
  };

  const handleApplyTemplate = async () => {
    try {
      await applyTemplate(applyTemplateData);
      setShowApplyTemplateModal(false);
      setApplyTemplateData({
        entityType: '',
        entityId: 0,
        templateName: '',
      });
      showSuccess('Plantilla aplicada exitosamente');
    } catch (error) {
      console.error(error);
      showError('Error al aplicar la plantilla');
    }
  };

  const handleToggleStatus = async (item: SignatureConfiguration) => {
    try {
      await toggleConfigurationStatus(item.id, !item.isActive);
      showSuccess(
        `Configuración ${item.isActive ? 'desactivada' : 'activada'} exitosamente`
      );
    } catch (error) {
      console.error(error);
      showError('Error al cambiar el estado de la configuración');
    }
  };

  const handleDelete = async (
    item: SignatureConfiguration | ApprovalFlowTemplate,
    type: 'config' | 'template'
  ) => {
    if (
      window.confirm('¿Estás seguro de que quieres eliminar este elemento?')
    ) {
      try {
        if (type === 'config') {
          await deleteConfiguration(item.id);
        } else {
          await deleteTemplate(item.id);
        }
        showSuccess('Elemento eliminado exitosamente');
      } catch (error) {
        console.error(error);
        showError('Error al eliminar el elemento');
      }
    }
  };

  const handleInputChange = (
    field: keyof CreateSignatureConfigurationDto,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateInputChange = (
    field: keyof CreateTemplateDto,
    value: string | number | boolean
  ) => {
    setTemplateFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    if (!editingItem) return;

    setEditingItem(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleApplyTemplateInputChange = (
    field: keyof ApplyTemplateDto,
    value: string | number
  ) => {
    setApplyTemplateData(prev => ({ ...prev, [field]: value }));
  };

  const openViewModal = (
    item: SignatureConfiguration | ApprovalFlowTemplate
  ) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const openEditModal = (
    item: SignatureConfiguration | ApprovalFlowTemplate,
    type: 'config' | 'template'
  ) => {
    setEditingItem({ ...item });
    if (type === 'config') {
      setShowEditConfigModal(true);
    } else {
      setShowEditTemplateModal(true);
    }
  };

  const openApplyTemplateModal = () => {
    setShowApplyTemplateModal(true);
  };

  const getEntityTypeDisplayName = (entityType: string): string => {
    const displayNames: { [key: string]: string } = {
      requirement: 'Requerimiento',
      quotation: 'Cotización',
      purchase_order: 'Orden de Compra',
      fuel_control: 'Control de Combustible',
      entry_part: 'Parte de Entrada',
      exit_part: 'Parte de Salida',
    };
    return displayNames[entityType] || entityType;
  };

  const getAvailableTemplates = (
    entityType: string
  ): ApprovalFlowTemplate[] => {
    return templates.filter(template => template.entityType === entityType);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorBanner message={error} onClose={() => {}} />
      </div>
    );
  }

  return (
    <div className="mx-auto p-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración de Firmas
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('configurations')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'configurations'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Configuraciones
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Plantillas
          </button>
        </div>
      </div>

      {activeTab === 'configurations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Configuraciones de Documentos
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={openApplyTemplateModal}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Aplicar Plantilla
              </button>
              <button
                onClick={() => setShowCreateConfigModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nueva Configuración
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo de Entidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID Entidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nivel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Requerido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {configurations.map(config => (
                    <tr key={config.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {getEntityTypeDisplayName(config.entityType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {config.entityId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {config.signatureLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {config.roleName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            config.isRequired
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {config.isRequired ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <button
                          onClick={() => handleToggleStatus(config)}
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                            config.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                          }`}
                        >
                          {config.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openViewModal(config)}
                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(config, 'config')}
                            className="text-yellow-600 hover:text-yellow-900 dark:hover:text-yellow-400"
                            title="Editar"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(config, 'config')}
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
        </div>
      )}

      {activeTab === 'templates' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Plantillas de Configuración
            </h3>
            <button
              onClick={() => setShowCreateTemplateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </button>
          </div>

          {/* Mostrar templates agrupados */}
          {Object.entries(groupedTemplates).map(([entityType, templates]) => (
            <div key={entityType} className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {getEntityTypeDisplayName(entityType)}
              </h4>
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Nivel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Requerido
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
                      {templates.map(template => (
                        <tr key={template.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {template.templateName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {template.signatureLevel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {template.roleName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                template.isRequired
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}
                            >
                              {template.isRequired ? 'Sí' : 'No'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {template.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openViewModal(template)}
                                className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                                title="Ver detalles"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  openEditModal(template, 'template')
                                }
                                className="text-yellow-600 hover:text-yellow-900 dark:hover:text-yellow-400"
                                title="Editar"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(template, 'template')
                                }
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
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear configuración */}
      <Modal
        isOpen={showCreateConfigModal}
        onClose={() => setShowCreateConfigModal(false)}
        title="Crear Nueva Configuración"
      >
        <div className="space-y-4">
          <FormSelect
            label="Tipo de Entidad"
            name="entityType"
            value={formData.entityType}
            onChange={e => handleInputChange('entityType', e.target.value)}
          >
            <option value="">Seleccionar tipo</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>
                {getEntityTypeDisplayName(type)}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="ID de Entidad"
            name="entityId"
            type="number"
            value={formData.entityId}
            onChange={e =>
              handleInputChange('entityId', parseInt(e.target.value))
            }
            placeholder="ID del documento"
            required
          />
          <FormSelect
            label="Nivel de Firma"
            name="signatureLevel"
            value={formData.signatureLevel}
            onChange={e =>
              handleInputChange('signatureLevel', parseInt(e.target.value))
            }
          >
            {signatureLevels.map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            label="Rol"
            name="roleName"
            value={formData.roleName}
            onChange={e => handleInputChange('roleName', e.target.value)}
          >
            <option value="">Seleccionar rol</option>
            {signatureRoles.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </FormSelect>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRequired"
              checked={formData.isRequired}
              onChange={e => handleInputChange('isRequired', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isRequired"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              Firma requerida
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateConfigModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreateConfiguration}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Crear
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para crear plantilla */}
      <Modal
        isOpen={showCreateTemplateModal}
        onClose={() => setShowCreateTemplateModal(false)}
        title="Crear Nueva Plantilla"
      >
        <div className="space-y-4">
          <FormInput
            label="Nombre de la Plantilla"
            name="templateName"
            value={templateFormData.templateName}
            onChange={e =>
              handleTemplateInputChange('templateName', e.target.value)
            }
            placeholder="Ej: DEFAULT"
            required
          />
          <FormSelect
            label="Tipo de Entidad"
            name="entityType"
            value={templateFormData.entityType}
            onChange={e =>
              handleTemplateInputChange('entityType', e.target.value)
            }
          >
            <option value="">Seleccionar tipo</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>
                {getEntityTypeDisplayName(type)}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            label="Nivel de Firma"
            name="signatureLevel"
            value={templateFormData.signatureLevel}
            onChange={e =>
              handleTemplateInputChange(
                'signatureLevel',
                parseInt(e.target.value)
              )
            }
          >
            {signatureLevels.map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            label="Rol"
            name="roleName"
            value={templateFormData.roleName}
            onChange={e =>
              handleTemplateInputChange('roleName', e.target.value)
            }
          >
            <option value="">Seleccionar rol</option>
            {signatureRoles.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Descripción"
            name="description"
            value={templateFormData.description}
            onChange={e =>
              handleTemplateInputChange('description', e.target.value)
            }
            placeholder="Descripción de la plantilla"
          />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="templateIsRequired"
              checked={templateFormData.isRequired}
              onChange={e =>
                handleTemplateInputChange('isRequired', e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="templateIsRequired"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              Firma requerida
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateTemplateModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreateTemplate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Crear
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para aplicar plantilla */}
      <Modal
        isOpen={showApplyTemplateModal}
        onClose={() => setShowApplyTemplateModal(false)}
        title="Aplicar Plantilla"
      >
        <div className="space-y-4">
          <FormSelect
            label="Tipo de Entidad"
            name="entityType"
            value={applyTemplateData.entityType}
            onChange={e =>
              handleApplyTemplateInputChange('entityType', e.target.value)
            }
          >
            <option value="">Seleccionar tipo</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>
                {getEntityTypeDisplayName(type)}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="ID de Entidad"
            name="entityId"
            type="number"
            value={applyTemplateData.entityId}
            onChange={e =>
              handleApplyTemplateInputChange(
                'entityId',
                parseInt(e.target.value)
              )
            }
            placeholder="ID del documento"
            required
          />
          <FormSelect
            label="Plantilla"
            name="templateName"
            value={applyTemplateData.templateName}
            onChange={e =>
              handleApplyTemplateInputChange('templateName', e.target.value)
            }
          >
            <option value="">Seleccionar plantilla</option>
            {applyTemplateData.entityType &&
              getAvailableTemplates(applyTemplateData.entityType).map(
                template => (
                  <option key={template.id} value={template.templateName}>
                    {template.templateName}
                  </option>
                )
              )}
          </FormSelect>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowApplyTemplateModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApplyTemplate}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Aplicar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para editar configuración */}
      <Modal
        isOpen={showEditConfigModal}
        onClose={() => setShowEditConfigModal(false)}
        title="Editar Configuración"
      >
        {editingItem && 'entityId' in editingItem && (
          <div className="space-y-4">
            <FormSelect
              label="Tipo de Entidad"
              name="entityType"
              value={editingItem.entityType}
              onChange={e =>
                handleEditInputChange('entityType', e.target.value)
              }
            >
              {entityTypes.map(type => (
                <option key={type} value={type}>
                  {getEntityTypeDisplayName(type)}
                </option>
              ))}
            </FormSelect>
            <FormInput
              label="ID de Entidad"
              name="entityId"
              type="number"
              value={editingItem.entityId}
              onChange={e =>
                handleEditInputChange('entityId', parseInt(e.target.value))
              }
              placeholder="ID del documento"
              required
            />
            <FormSelect
              label="Nivel de Firma"
              name="signatureLevel"
              value={editingItem.signatureLevel}
              onChange={e =>
                handleEditInputChange(
                  'signatureLevel',
                  parseInt(e.target.value)
                )
              }
            >
              {signatureLevels.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </FormSelect>
            <FormSelect
              label="Rol"
              name="roleName"
              value={editingItem.roleName}
              onChange={e => handleEditInputChange('roleName', e.target.value)}
            >
              {signatureRoles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </FormSelect>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editIsRequired"
                checked={editingItem.isRequired}
                onChange={e =>
                  handleEditInputChange('isRequired', e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="editIsRequired"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                Firma requerida
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditConfigModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEditConfiguration}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Actualizar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para editar plantilla */}
      <Modal
        isOpen={showEditTemplateModal}
        onClose={() => setShowEditTemplateModal(false)}
        title="Editar Plantilla"
      >
        {editingItem && 'templateName' in editingItem && (
          <div className="space-y-4">
            <FormInput
              label="Nombre de la Plantilla"
              name="templateName"
              value={editingItem.templateName}
              onChange={e =>
                handleEditInputChange('templateName', e.target.value)
              }
              placeholder="Ej: DEFAULT"
              required
            />
            <FormSelect
              label="Tipo de Entidad"
              name="entityType"
              value={editingItem.entityType}
              onChange={e =>
                handleEditInputChange('entityType', e.target.value)
              }
            >
              {entityTypes.map(type => (
                <option key={type} value={type}>
                  {getEntityTypeDisplayName(type)}
                </option>
              ))}
            </FormSelect>
            <FormSelect
              label="Nivel de Firma"
              name="signatureLevel"
              value={editingItem.signatureLevel}
              onChange={e =>
                handleEditInputChange(
                  'signatureLevel',
                  parseInt(e.target.value)
                )
              }
            >
              {signatureLevels.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </FormSelect>
            <FormSelect
              label="Rol"
              name="roleName"
              value={editingItem.roleName}
              onChange={e => handleEditInputChange('roleName', e.target.value)}
            >
              {signatureRoles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </FormSelect>
            <FormInput
              label="Descripción"
              name="description"
              value={editingItem.description || ''}
              onChange={e =>
                handleEditInputChange('description', e.target.value)
              }
              placeholder="Descripción de la plantilla"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editTemplateIsRequired"
                checked={editingItem.isRequired}
                onChange={e =>
                  handleEditInputChange('isRequired', e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="editTemplateIsRequired"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                Firma requerida
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditTemplateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEditTemplate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Actualizar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para ver detalles */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalles"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de Entidad
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {'entityType' in selectedItem
                    ? getEntityTypeDisplayName(selectedItem.entityType)
                    : '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nivel de Firma
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedItem.signatureLevel}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rol
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedItem.roleName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Requerido
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedItem.isRequired ? 'Sí' : 'No'}
                </p>
              </div>
              {'templateName' in selectedItem && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre de Plantilla
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedItem.templateName}
                  </p>
                </div>
              )}
              {'templateName' in selectedItem && selectedItem.description && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedItem.description}
                  </p>
                </div>
              )}
              {'entityId' in selectedItem && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      ID Entidad
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedItem.entityId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estado
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedItem.isActive ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
