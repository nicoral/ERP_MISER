import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentApprovalConfiguration } from '../entities/DocumentApprovalConfiguration.entity';
import { ApprovalFlowTemplate } from '../entities/ApprovalFlowTemplate.entity';
import { GeneralSettingsService } from './generalSettings.service';
import { Employee } from '../entities/Employee.entity';

export interface GroupedTemplates {
  [key: string]: ApprovalFlowTemplate[];
}

@Injectable()
export class DocumentApprovalConfigurationService {
  constructor(
    @InjectRepository(DocumentApprovalConfiguration)
    private readonly documentApprovalConfigurationRepository: Repository<
    DocumentApprovalConfiguration>,
    @InjectRepository(ApprovalFlowTemplate)
    private readonly approvalFlowTemplateRepository: Repository<ApprovalFlowTemplate>,
    private readonly generalSettingsService: GeneralSettingsService
  ) {}

  /**
   * Obtiene todas las configuraciones
   */
  async getAllConfigurations(): Promise<DocumentApprovalConfiguration[]> {
    return this.documentApprovalConfigurationRepository.find({
      relations: ['updatedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene configuración específica de un documento
   */
  async getConfigurationForDocument(
    entityType: string,
    entityId: number
  ): Promise<DocumentApprovalConfiguration[]> {
    return this.documentApprovalConfigurationRepository.find({
      where: { entityType, entityId, isActive: true },
      relations: ['updatedBy'],
      order: { signatureLevel: 'ASC' },
    });
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
    // Desactivar configuraciones existentes
    await this.documentApprovalConfigurationRepository.update(
      { entityType, entityId },
      { isActive: false }
    );

    // Crear nuevas configuraciones
    const configsToSave = configurations.map(config =>
      this.documentApprovalConfigurationRepository.create({
        entityType,
        entityId,
        signatureLevel: config.signatureLevel,
        roleName: config.roleName,
        isRequired: config.isRequired,
        isActive: true,
        updatedBy: { id: userId } as Employee,
      })
    );

    await this.documentApprovalConfigurationRepository.save(configsToSave);
  }

  /**
   * Actualiza una configuración existente
   */
  async updateConfiguration(
    id: number,
    configData: {
      entityType: string;
      entityId: number;
      signatureLevel: number;
      roleName: string;
      isRequired: boolean;
    }
  ): Promise<DocumentApprovalConfiguration> {
    const config = await this.documentApprovalConfigurationRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Configuration with id ${id} not found`);
    }

    Object.assign(config, configData);
    return this.documentApprovalConfigurationRepository.save(config);
  }

  /**
   * Elimina una configuración
   */
  async deleteConfiguration(id: number): Promise<void> {
    const config = await this.documentApprovalConfigurationRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Configuration with id ${id} not found`);
    }

    await this.documentApprovalConfigurationRepository.remove(config);
  }

  /**
   * Obtiene todas las plantillas disponibles
   */
  async getAllTemplates(): Promise<ApprovalFlowTemplate[]> {
    return this.approvalFlowTemplateRepository.find({
      order: { templateName: 'ASC' },
    });
  }

  /**
   * Obtiene plantillas agrupadas por tipo de entidad
   */
  async getGroupedTemplates(): Promise<GroupedTemplates> {
    const templates = await this.approvalFlowTemplateRepository.find({
      order: { templateName: 'ASC' },
    });

    const grouped: GroupedTemplates = {};

    templates.forEach(template => {
      if (!grouped[template.entityType]) {
        grouped[template.entityType] = [];
      }
      grouped[template.entityType].push(template);
    });

    return grouped;
  }

  /**
   * Obtiene plantillas por tipo de entidad
   */
  async getTemplatesByEntityType(
    entityType: string
  ): Promise<ApprovalFlowTemplate[]> {
    return this.approvalFlowTemplateRepository.find({
      where: { entityType },
      order: { templateName: 'ASC' },
    });
  }

  /**
   * Crea una nueva plantilla
   */
  async createTemplate(templateData: {
    templateName: string;
    entityType: string;
    signatureLevel: number;
    roleName: string;
    isRequired: boolean;
    description?: string;
  }): Promise<ApprovalFlowTemplate> {
    const template = this.approvalFlowTemplateRepository.create(templateData);
    return this.approvalFlowTemplateRepository.save(template);
  }

  /**
   * Actualiza una plantilla existente
   */
  async updateTemplate(
    id: number,
    templateData: {
      templateName: string;
      entityType: string;
      signatureLevel: number;
      roleName: string;
      isRequired: boolean;
      description?: string;
    }
  ): Promise<ApprovalFlowTemplate> {
    const template = await this.approvalFlowTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    Object.assign(template, templateData);
    return this.approvalFlowTemplateRepository.save(template);
  }

  /**
   * Elimina una plantilla
   */
  async deleteTemplate(id: number): Promise<void> {
    const template = await this.approvalFlowTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    await this.approvalFlowTemplateRepository.remove(template);
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
    const templates = await this.approvalFlowTemplateRepository.find({
      where: { templateName, entityType },
    });

    if (templates.length === 0) {
      throw new NotFoundException(
        `Template ${templateName} not found for entity type ${entityType}`
      );
    }

    // Desactivar configuraciones existentes
    await this.documentApprovalConfigurationRepository.update(
      { entityType, entityId },
      { isActive: false }
    );

    // Crear nuevas configuraciones basadas en la plantilla
    const configsToSave = templates.map(template =>
      this.documentApprovalConfigurationRepository.create({
        entityType,
        entityId,
        signatureLevel: template.signatureLevel,
        roleName: template.roleName,
        isRequired: template.isRequired,
        isActive: true,
        updatedBy: { id: userId } as Employee,
      })
    );

    await this.documentApprovalConfigurationRepository.save(configsToSave);
  }

  /**
   * Obtiene configuraciones por tipo de entidad
   */
  async getConfigurationsByEntityType(
    entityType: string
  ): Promise<DocumentApprovalConfiguration[]> {
    return this.documentApprovalConfigurationRepository.find({
      where: { entityType, isActive: true },
      relations: ['updatedBy'],
      order: { signatureLevel: 'ASC' },
    });
  }

  /**
   * Activa/desactiva una configuración
   */
  async toggleConfigurationStatus(
    id: number,
    isActive: boolean
  ): Promise<DocumentApprovalConfiguration> {
    const config = await this.documentApprovalConfigurationRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Configuration with id ${id} not found`);
    }

    config.isActive = isActive;
    return this.documentApprovalConfigurationRepository.save(config);
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

  /**
   * Obtiene tipos de entidades disponibles
   */
  async getAvailableEntityTypes(): Promise<string[]> {
    const templates = await this.approvalFlowTemplateRepository
      .createQueryBuilder('template')
      .select('DISTINCT template.entityType', 'entityType')
      .getRawMany();

    return templates.map(t => t.entityType);
  }
}
