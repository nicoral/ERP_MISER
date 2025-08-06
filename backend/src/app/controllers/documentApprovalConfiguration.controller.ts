import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { DocumentApprovalConfigurationService } from '../services/documentApprovalConfiguration.service';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { GroupedTemplates } from '../services/documentApprovalConfiguration.service';

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

@Controller('document-approval-configurations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentApprovalConfigurationController {
  constructor(
    private readonly documentApprovalConfigurationService: DocumentApprovalConfigurationService
  ) {}

  @Get()
  @Roles(1)
  @AuditDescription('Consulta de configuraciones de firmas')
  async getAllConfigurations() {
    return this.documentApprovalConfigurationService.getAllConfigurations();
  }

  @Get('document/:entityType/:entityId')
  @Roles(1)
  @AuditDescription('Consulta de configuración específica de documento')
  async getDocumentConfiguration(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string
  ) {
    return this.documentApprovalConfigurationService.getConfigurationForDocument(
      entityType,
      parseInt(entityId)
    );
  }

  @Post('create')
  @Roles(1)
  @AuditDescription('Creación de configuración de firma')
  async createConfiguration(
    @Body() createDto: CreateSignatureConfigurationDto
  ) {
    return this.documentApprovalConfigurationService.createCustomConfiguration(
      createDto.entityType,
      createDto.entityId,
      [
        {
          signatureLevel: createDto.signatureLevel,
          roleName: createDto.roleName,
          isRequired: createDto.isRequired,
        },
      ],
      1 // userId - se debería obtener del contexto de autenticación
    );
  }

  @Put(':id')
  @Roles(1)
  @AuditDescription('Actualización de configuración de firma')
  async updateConfiguration(
    @Param('id') id: string,
    @Body() updateDto: CreateSignatureConfigurationDto
  ) {
    // Implementar actualización
    return this.documentApprovalConfigurationService.updateConfiguration(
      parseInt(id),
      updateDto
    );
  }

  @Delete(':id')
  @Roles(1)
  @AuditDescription('Eliminación de configuración de firma')
  async deleteConfiguration(@Param('id') id: string) {
    return this.documentApprovalConfigurationService.deleteConfiguration(
      parseInt(id)
    );
  }

  @Get('templates')
  @Roles(1)
  @AuditDescription('Consulta de plantillas disponibles')
  async getAllTemplates() {
    return this.documentApprovalConfigurationService.getAllTemplates();
  }

  @Get('templates/grouped')
  @Roles(1)
  @AuditDescription('Consulta de plantillas agrupadas por tipo')
  async getGroupedTemplates(): Promise<GroupedTemplates> {
    return this.documentApprovalConfigurationService.getGroupedTemplates();
  }

  @Get('templates/:entityType')
  @Roles(1)
  @AuditDescription('Consulta de plantillas por tipo de entidad')
  async getTemplatesByEntityType(@Param('entityType') entityType: string) {
    return this.documentApprovalConfigurationService.getTemplatesByEntityType(
      entityType
    );
  }

  @Post('templates')
  @Roles(1)
  @AuditDescription('Creación de plantilla de configuración')
  async createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
    return this.documentApprovalConfigurationService.createTemplate(
      createTemplateDto
    );
  }

  @Put('templates/:id')
  @Roles(1)
  @AuditDescription('Actualización de plantilla de configuración')
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: CreateTemplateDto
  ) {
    return this.documentApprovalConfigurationService.updateTemplate(
      parseInt(id),
      updateTemplateDto
    );
  }

  @Delete('templates/:id')
  @Roles(1)
  @AuditDescription('Eliminación de plantilla de configuración')
  async deleteTemplate(@Param('id') id: string) {
    return this.documentApprovalConfigurationService.deleteTemplate(
      parseInt(id)
    );
  }

  @Post('apply-template')
  @Roles(1)
  @AuditDescription('Aplicación de plantilla a documento')
  async applyTemplate(@Body() applyTemplateDto: ApplyTemplateDto) {
    return this.documentApprovalConfigurationService.applyTemplateToDocument(
      applyTemplateDto.entityType,
      applyTemplateDto.entityId,
      applyTemplateDto.templateName,
      1 // userId - se debería obtener del contexto de autenticación
    );
  }

  @Get('entity-type/:entityType')
  @Roles(1)
  @AuditDescription('Consulta de configuraciones por tipo de entidad')
  async getConfigurationsByEntityType(@Param('entityType') entityType: string) {
    return this.documentApprovalConfigurationService.getConfigurationsByEntityType(
      entityType
    );
  }

  @Get('entity-types')
  @Roles(1)
  @AuditDescription('Consulta de tipos de entidades disponibles')
  async getAvailableEntityTypes() {
    return this.documentApprovalConfigurationService.getAvailableEntityTypes();
  }

  @Post(':id/toggle-status')
  @Roles(1)
  @AuditDescription('Cambio de estado de configuración')
  async toggleConfigurationStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean }
  ) {
    return this.documentApprovalConfigurationService.toggleConfigurationStatus(
      parseInt(id),
      body.isActive
    );
  }
}
