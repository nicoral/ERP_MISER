import { createApiCall } from './httpInterceptor';
import type {
  DocumentApprovalConfiguration,
  ApprovalFlowTemplate,
  CreateDocumentApprovalConfigurationDto,
  ApplyTemplateDto,
  DocumentApprovalConfigurationResponse,
  TemplateResponse,
  EntityType,
} from '../../types/documentApprovalConfiguration';

const BASE_URL = `${import.meta.env.VITE_API_URL}/document-approval-configurations`;

export const documentApprovalConfigurationService = {
  /**
   * Crea una configuración personalizada para un documento
   */
  async createConfiguration(
    createDto: CreateDocumentApprovalConfigurationDto
  ): Promise<DocumentApprovalConfigurationResponse> {
    const response = await createApiCall<DocumentApprovalConfigurationResponse>(
      `${BASE_URL}/create`,
      {
        method: 'POST',
        body: JSON.stringify(createDto),
      }
    );
    return response;
  },

  /**
   * Aplica una plantilla a un documento específico
   */
  async applyTemplate(
    applyTemplateDto: ApplyTemplateDto
  ): Promise<TemplateResponse> {
    const response = await createApiCall<TemplateResponse>(
      `${BASE_URL}/apply-template`,
      {
        method: 'POST',
        body: JSON.stringify(applyTemplateDto),
      }
    );
    return response;
  },

  /**
   * Obtiene las plantillas disponibles para un tipo de entidad
   */
  async getAvailableTemplates(
    entityType: EntityType
  ): Promise<ApprovalFlowTemplate[]> {
    const response = await createApiCall<ApprovalFlowTemplate[]>(
      `${BASE_URL}/templates/${entityType}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  /**
   * Obtiene la configuración específica de un documento
   */
  async getDocumentConfiguration(
    entityType: EntityType,
    entityId: number
  ): Promise<DocumentApprovalConfiguration[]> {
    const response = await createApiCall<DocumentApprovalConfiguration[]>(
      `${BASE_URL}/document/${entityType}/${entityId}`,
      {
        method: 'GET',
      }
    );
    return response;
  },
};
