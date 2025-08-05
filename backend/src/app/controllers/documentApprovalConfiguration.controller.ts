import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { DocumentApprovalConfigurationService } from '../services/documentApprovalConfiguration.service';
import { CreateDocumentApprovalConfigurationDto } from '../dto/documentApprovalConfiguration/create-document-approval-configuration.dto';
import { ApplyTemplateDto } from '../dto/documentApprovalConfiguration/apply-template.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';

@Controller('document-approval-configurations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentApprovalConfigurationController {
  constructor(
    private readonly documentApprovalConfigurationService: DocumentApprovalConfigurationService
  ) {}

  @Post('create')
  @RequirePermissions('document-approval-configuration-create')
  async createConfiguration(
    @Body() createDto: CreateDocumentApprovalConfigurationDto
  ) {
    await this.documentApprovalConfigurationService.createCustomConfiguration(
      createDto.entityType,
      createDto.entityId,
      createDto.configurations,
      1 // userId - debería venir del request
    );
    return { message: 'Configuración creada exitosamente' };
  }

  @Post('apply-template')
  @RequirePermissions('document-approval-configuration-apply-template')
  async applyTemplate(@Body() applyTemplateDto: ApplyTemplateDto) {
    await this.documentApprovalConfigurationService.applyTemplateToDocument(
      'requirement', // entityType - debería ser dinámico
      applyTemplateDto.entityId,
      applyTemplateDto.templateName,
      1 // userId - debería venir del request
    );
    return { message: 'Plantilla aplicada exitosamente' };
  }

  @Get('templates/:entityType')
  async getAvailableTemplates(@Param('entityType') entityType: string) {
    return this.documentApprovalConfigurationService.getAvailableTemplates(
      entityType
    );
  }

  @Get('document/:entityType/:entityId')
  async getDocumentConfiguration(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: number
  ) {
    return this.documentApprovalConfigurationService.getConfigurationForDocument(
      entityType,
      entityId
    );
  }
}
