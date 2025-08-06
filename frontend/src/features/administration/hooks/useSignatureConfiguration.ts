import { useState, useEffect } from 'react';
import { signatureConfigurationService } from '../../../services/api/signatureConfigurationService';

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

interface GroupedTemplates {
  [key: string]: ApprovalFlowTemplate[];
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

export const useSignatureConfiguration = () => {
  const [configurations, setConfigurations] = useState<
    SignatureConfiguration[]
  >([]);
  const [templates, setTemplates] = useState<ApprovalFlowTemplate[]>([]);
  const [groupedTemplates, setGroupedTemplates] = useState<GroupedTemplates>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfigurations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await signatureConfigurationService.getAllConfigurations();
      setConfigurations(data);
    } catch (err) {
      setError('Error al cargar las configuraciones');
      console.error('Error loading configurations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await signatureConfigurationService.getAllTemplates();
      setTemplates(data);
    } catch (err) {
      setError('Error al cargar las plantillas');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupedTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await signatureConfigurationService.getGroupedTemplates();
      setGroupedTemplates(data);
    } catch (err) {
      setError('Error al cargar las plantillas agrupadas');
      console.error('Error loading grouped templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createConfiguration = async (
    configData: CreateSignatureConfigurationDto
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newConfig =
        await signatureConfigurationService.createConfiguration(configData);
      setConfigurations(prev => [...prev, newConfig]);
      return newConfig;
    } catch (err) {
      setError('Error al crear la configuración');
      console.error('Error creating configuration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (
    id: number,
    configData: CreateSignatureConfigurationDto
  ) => {
    setLoading(true);
    setError(null);
    try {
      const updatedConfig =
        await signatureConfigurationService.updateConfiguration(id, configData);
      setConfigurations(prev =>
        prev.map(config => (config.id === id ? updatedConfig : config))
      );
      return updatedConfig;
    } catch (err) {
      setError('Error al actualizar la configuración');
      console.error('Error updating configuration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteConfiguration = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await signatureConfigurationService.deleteConfiguration(id);
      setConfigurations(prev => prev.filter(config => config.id !== id));
    } catch (err) {
      setError('Error al eliminar la configuración');
      console.error('Error deleting configuration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: CreateTemplateDto) => {
    setLoading(true);
    setError(null);
    try {
      const newTemplate =
        await signatureConfigurationService.createTemplate(templateData);
      setTemplates(prev => [...prev, newTemplate]);
      // Recargar templates agrupados
      await loadGroupedTemplates();
      return newTemplate;
    } catch (err) {
      setError('Error al crear la plantilla');
      console.error('Error creating template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (
    id: number,
    templateData: CreateTemplateDto
  ) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTemplate =
        await signatureConfigurationService.updateTemplate(id, templateData);
      setTemplates(prev =>
        prev.map(template => (template.id === id ? updatedTemplate : template))
      );
      // Recargar templates agrupados
      await loadGroupedTemplates();
      return updatedTemplate;
    } catch (err) {
      setError('Error al actualizar la plantilla');
      console.error('Error updating template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await signatureConfigurationService.deleteTemplate(id);
      setTemplates(prev => prev.filter(template => template.id !== id));
      // Recargar templates agrupados
      await loadGroupedTemplates();
    } catch (err) {
      setError('Error al eliminar la plantilla');
      console.error('Error deleting template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async (applyData: ApplyTemplateDto) => {
    setLoading(true);
    setError(null);
    try {
      await signatureConfigurationService.applyTemplate(applyData);
      // Recargar configuraciones después de aplicar plantilla
      await loadConfigurations();
    } catch (err) {
      setError('Error al aplicar la plantilla');
      console.error('Error applying template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleConfigurationStatus = async (id: number, isActive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const updatedConfig =
        await signatureConfigurationService.toggleConfigurationStatus(
          id,
          isActive
        );
      setConfigurations(prev =>
        prev.map(config => (config.id === id ? updatedConfig : config))
      );
      return updatedConfig;
    } catch (err) {
      setError('Error al cambiar el estado de la configuración');
      console.error('Error toggling configuration status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocumentConfiguration = async (
    entityType: string,
    entityId: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signatureConfigurationService.getDocumentConfiguration(
        entityType,
        entityId
      );
      return data;
    } catch (err) {
      setError('Error al obtener la configuración del documento');
      console.error('Error getting document configuration:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTemplatesByEntityType = async (entityType: string) => {
    setLoading(true);
    setError(null);
    try {
      const data =
        await signatureConfigurationService.getTemplatesByEntityType(
          entityType
        );
      return data;
    } catch (err) {
      setError('Error al obtener las plantillas por tipo de entidad');
      console.error('Error getting templates by entity type:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableEntityTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        await signatureConfigurationService.getAvailableEntityTypes();
      return data;
    } catch (err) {
      setError('Error al obtener los tipos de entidades disponibles');
      console.error('Error getting available entity types:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigurations();
    loadTemplates();
    loadGroupedTemplates();
  }, []);

  return {
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
    getDocumentConfiguration,
    getTemplatesByEntityType,
    getAvailableEntityTypes,
    loadConfigurations,
    loadTemplates,
    loadGroupedTemplates,
  };
};
