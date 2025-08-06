import { createApiCall } from './httpInterceptor';

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

const BASE_URL = `${import.meta.env.VITE_API_URL}`;

export const signatureConfigurationService = {
  /**
   * Obtiene todas las configuraciones de firmas
   */
  getAllConfigurations: (): Promise<SignatureConfiguration[]> => {
    return createApiCall<SignatureConfiguration[]>(
      `${BASE_URL}/document-approval-configurations`,
      {
        method: 'GET',
      }
    );
  },

  /**
   * Obtiene configuración específica de un documento
   */
  getDocumentConfiguration: (
    entityType: string,
    entityId: number
  ): Promise<SignatureConfiguration[]> => {
    return createApiCall<SignatureConfiguration[]>(
      `${BASE_URL}/document-approval-configurations/document/${entityType}/${entityId}`,
      {
        method: 'GET',
      }
    );
  },

  /**
   * Crea una nueva configuración de firma
   */
  createConfiguration: (
    configData: CreateSignatureConfigurationDto
  ): Promise<SignatureConfiguration> => {
    return createApiCall<SignatureConfiguration>(
      `${BASE_URL}/document-approval-configurations/create`,
      {
        method: 'POST',
        body: JSON.stringify(configData),
      }
    );
  },

  /**
   * Actualiza una configuración existente
   */
  updateConfiguration: (
    id: number,
    configData: CreateSignatureConfigurationDto
  ): Promise<SignatureConfiguration> => {
    return createApiCall<SignatureConfiguration>(
      `${BASE_URL}/document-approval-configurations/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(configData),
      }
    );
  },

  /**
   * Elimina una configuración
   */
  deleteConfiguration: (id: number): Promise<void> => {
    return createApiCall<void>(
      `${BASE_URL}/document-approval-configurations/${id}`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Obtiene todas las plantillas disponibles
   */
  getAllTemplates: (): Promise<ApprovalFlowTemplate[]> => {
    return createApiCall<ApprovalFlowTemplate[]>(
      `${BASE_URL}/document-approval-configurations/templates`,
      {
        method: 'GET',
      }
    );
  },

  /**
   * Obtiene plantillas agrupadas por tipo de entidad
   */
  getGroupedTemplates: (): Promise<GroupedTemplates> => {
    return createApiCall<GroupedTemplates>(
      `${BASE_URL}/document-approval-configurations/templates/grouped`,
      {
        method: 'GET',
      }
    );
  },

  /**
   * Obtiene plantillas por tipo de entidad
   */
  getTemplatesByEntityType: (
    entityType: string
  ): Promise<ApprovalFlowTemplate[]> => {
    return createApiCall<ApprovalFlowTemplate[]>(
      `${BASE_URL}/document-approval-configurations/templates/${entityType}`,
      {
        method: 'GET',
      }
    );
  },

  /**
   * Crea una nueva plantilla
   */
  createTemplate: (
    templateData: CreateTemplateDto
  ): Promise<ApprovalFlowTemplate> => {
    return createApiCall<ApprovalFlowTemplate>(
      `${BASE_URL}/document-approval-configurations/templates`,
      {
        method: 'POST',
        body: JSON.stringify(templateData),
      }
    );
  },

  /**
   * Actualiza una plantilla existente
   */
  updateTemplate: (
    id: number,
    templateData: CreateTemplateDto
  ): Promise<ApprovalFlowTemplate> => {
    return createApiCall<ApprovalFlowTemplate>(
      `${BASE_URL}/document-approval-configurations/templates/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(templateData),
      }
    );
  },

  /**
   * Elimina una plantilla
   */
  deleteTemplate: (id: number): Promise<void> => {
    return createApiCall<void>(
      `${BASE_URL}/document-approval-configurations/templates/${id}`,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Aplica una plantilla a un documento específico
   */
  applyTemplate: (applyData: ApplyTemplateDto): Promise<void> => {
    return createApiCall<void>(
      `${BASE_URL}/document-approval-configurations/apply-template`,
      {
        method: 'POST',
        body: JSON.stringify(applyData),
      }
    );
  },

  /**
   * Obtiene configuraciones por tipo de entidad
   */
  getConfigurationsByEntityType: (
    entityType: string
  ): Promise<SignatureConfiguration[]> => {
    return createApiCall<SignatureConfiguration[]>(
      `${BASE_URL}/document-approval-configurations/entity-type/${entityType}`,
      {
        method: 'GET',
      }
    );
  },

  /**
   * Obtiene tipos de entidades disponibles
   */
  getAvailableEntityTypes: (): Promise<string[]> => {
    return createApiCall<string[]>(
      `${BASE_URL}/document-approval-configurations/entity-types`,
      {
        method: 'GET',
      }
    );
  },

  /**
   * Activa/desactiva una configuración
   */
  toggleConfigurationStatus: (
    id: number,
    isActive: boolean
  ): Promise<SignatureConfiguration> => {
    return createApiCall<SignatureConfiguration>(
      `${BASE_URL}/document-approval-configurations/${id}/toggle-status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }
    );
  },
};
