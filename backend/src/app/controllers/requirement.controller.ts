import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { RequirementService } from '../services/requirement.service';
import { CreateRequirementDto } from '../dto/requirement/create-requirement.dto';
import { Requirement } from '../entities/Requirement.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { UpdateRequirementDto } from '../dto/requirement/update-requirement.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('requirements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RequirementController {
  constructor(private readonly requirementService: RequirementService) {}

  @Post()
  @RequirePermissions('create_requirement')
  @AuditDescription('Creación de requerimiento')
  async create(
    @Req() req,
    @Body() createRequirementDto: CreateRequirementDto
  ): Promise<Requirement> {
    return this.requirementService.create(req.user.id, createRequirementDto);
  }

  @Get()
  @RequirePermissions('view_requirements')
  @AuditDescription('Consulta de requerimientos')
  async findAll(
    @Req() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('type') type: 'ARTICLE' | 'SERVICE'
  ): Promise<{ requirements: Requirement[]; total: number }> {
    return this.requirementService.findAll(type, req.user.id, page, limit);
  }

  @Get('graph/distribution')
  @AuditDescription('Consulta de distribución de requerimientos')
  async findDistribution() {
    return this.requirementService.findDistribution();
  }

  @Get(':id/signature-configuration')
  @RequirePermissions('view_requirements')
  @AuditDescription('Consulta de configuración de firmas')
  async getSignatureConfiguration(@Param('id') id: number) {
    return this.requirementService.getSignatureConfiguration(id);
  }

  @Get(':id')
  @RequirePermissions('view_requirements')
  @AuditDescription('Consulta de requerimiento')
  async findOne(@Param('id') id: number): Promise<Requirement> {
    return this.requirementService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('update_requirement')
  @AuditDescription('Actualización de requerimiento')
  async update(
    @Param('id') id: number,
    @Body() updateRequirementDto: UpdateRequirementDto
  ): Promise<Requirement> {
    return this.requirementService.update(id, updateRequirementDto);
  }

  @Get('generate/pdf/:id')
  @AuditDescription('Generación de PDF de requerimiento')
  async generateRequirementPdf(@Res() res: Response, @Param('id') id: number) {
    const pdfBuffer = await this.requirementService.generateRequirementPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="requerimiento.pdf"',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Delete(':id')
  @RequirePermissions('delete_requirement')
  @AuditDescription('Eliminación de requerimiento')
  async remove(@Param('id') id: number): Promise<void> {
    return this.requirementService.remove(id);
  }

  @Post('sign/:id')
  @RequirePermissions('view_requirements')
  @AuditDescription('Firma de requerimiento')
  async sign(@Req() req, @Param('id') id: number): Promise<Requirement> {
    return this.requirementService.sign(id, req.user.id);
  }

  @Post('reject/:id')
  @RequirePermissions('view_requirements')
  @AuditDescription('Rechazo de requerimiento')
  async reject(
    @Req() req,
    @Param('id') id: number,
    @Body('reason') reason: string
  ): Promise<Requirement> {
    return this.requirementService.reject(id, req.user.id, reason);
  }

  @Post('upload-inform/:id')
  @RequirePermissions('view_requirements')
  @UseInterceptors(FileInterceptor('inform'))
  @AuditDescription('Subir informe de requerimiento')
  async uploadInform(
    @Req() req,
    @Param('id') id: number,
    @UploadedFile() inform: Express.Multer.File
  ): Promise<Requirement> {
    if (!inform) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }
    return this.requirementService.uploadInform(id, inform);
  }
}
