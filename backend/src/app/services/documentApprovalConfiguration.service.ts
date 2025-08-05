import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentApprovalConfiguration } from '../entities/DocumentApprovalConfiguration.entity';
import { ApprovalFlowTemplate } from '../entities/ApprovalFlowTemplate.entity';
import { GeneralSettingsService } from './generalSettings.service';

@Injectable()
export class DocumentApprovalConfigurationService {
  constructor(
    @InjectRepository(DocumentApprovalConfiguration)
    private readonly configRepository: Repository<DocumentApprovalConfiguration>,
    @InjectRepository(ApprovalFlowTemplate)
    private readonly templateRepository: Repository<ApprovalFlowTemplate>,
    private readonly generalSettingsService: GeneralSettingsService
  ) {}

  /**
   * Obtiene la configuración específica de un documento
   * Si no existe, usa la plantilla por defecto
   */
  async getConfigurationForDocument(
    entityType: string,
    entityId: number
  ): Promise<DocumentApprovalConfiguration[]> {
    // Buscar configuración específica del documento
    const configs = await this.configRepository.find({
      where: {
        entityType,
        entityId,
        isActive: true,
      },
      order: { signatureLevel: 'ASC' },
    });
    // Si no hay configuración específica, usar plantilla por defecto
    if (configs.length === 0) {
      const response: DocumentApprovalConfiguration[] = [];
      const templates = await this.templateRepository.find({
        where: {
          templateName: 'DEFAULT',
          entityType,
          isActive: true,
        },
        order: { signatureLevel: 'ASC' },
      });
      // Crear configuración específica basada en plantilla
      for (const template of templates) {
        const configCreated = this.configRepository.create({
          entityType: template.entityType,
          entityId,
          signatureLevel: template.signatureLevel,
          roleName: template.roleName,
          isRequired: template.isRequired,
          isActive: true,
        });
        response.push(await this.configRepository.save(configCreated));
      }
      return response;
    }
    return configs;
  }

  /**
   * Aplica una plantilla a un documento específico
   */
  async applyTemplateToDocument(
    entityType: string,
    entityId: number,
    templateName: string,
    userId: number
  ): Promise<void> {
    // Obtener plantilla
    const templates = await this.templateRepository.find({
      where: {
        templateName,
        entityType,
        isActive: true,
      },
      order: { signatureLevel: 'ASC' },
    });

    // Desactivar configuración existente
    await this.configRepository.update(
      { entityType, entityId },
      { isActive: false }
    );

    // Crear nueva configuración basada en plantilla
    const configs = templates.map(template => ({
      entityType: template.entityType,
      entityId,
      signatureLevel: template.signatureLevel,
      roleName: template.roleName,
      isRequired: template.isRequired,
      isActive: true,
      updatedBy: { id: userId },
    }));

    await this.configRepository.save(configs);
  }

  /**
   * Crea configuración personalizada para un documento
   */
  async createCustomConfiguration(
    entityType: string,
    entityId: number,
    configurations: Array<{
      signatureLevel: number;
      roleName: string;
      isRequired: boolean;
    }>,
    userId: number
  ): Promise<void> {
    // Desactivar configuración existente
    await this.configRepository.update(
      { entityType, entityId },
      { isActive: false }
    );

    // Crear nueva configuración personalizada
    const configs = configurations.map(config => ({
      entityType,
      entityId,
      signatureLevel: config.signatureLevel,
      roleName: config.roleName,
      isRequired: config.isRequired,
      isActive: true,
      updatedBy: { id: userId },
    }));

    await this.configRepository.save(configs);
  }

  /**
   * Obtiene todas las plantillas disponibles
   */
  async getAvailableTemplates(
    entityType: string
  ): Promise<ApprovalFlowTemplate[]> {
    return this.templateRepository.find({
      where: { entityType, isActive: true },
      order: { templateName: 'ASC', signatureLevel: 'ASC' },
    });
  }

  /**
   * Aplica configuración automática según el monto del documento
   */
  async applyConfigurationByAmount(
    entityType: string,
    entityId: number,
    totalAmount: number,
    userId: number
  ): Promise<void> {
    const lowAmountThreshold =
      await this.generalSettingsService.getLowAmountThreshold();

    if (totalAmount < lowAmountThreshold) {
      // Configuración para montos bajos (solo Solicitante + Administración)
      await this.createCustomConfiguration(
        entityType,
        entityId,
        [
          { signatureLevel: 1, roleName: 'SOLICITANTE', isRequired: true },
          { signatureLevel: 2, roleName: 'ADMINISTRACION', isRequired: true },
          { signatureLevel: 3, roleName: 'OFICINA_TECNICA', isRequired: false },
          { signatureLevel: 4, roleName: 'GERENCIA', isRequired: false },
        ],
        userId
      );
    } else {
      // Configuración para montos altos (todas las firmas)
      await this.createCustomConfiguration(
        entityType,
        entityId,
        [
          { signatureLevel: 1, roleName: 'SOLICITANTE', isRequired: true },
          { signatureLevel: 2, roleName: 'OFICINA_TECNICA', isRequired: true },
          { signatureLevel: 3, roleName: 'ADMINISTRACION', isRequired: true },
          { signatureLevel: 4, roleName: 'GERENCIA', isRequired: true },
        ],
        userId
      );
    }
  }
}
