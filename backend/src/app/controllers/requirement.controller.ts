import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { RequirementService } from '../services/requirement.service';
import { CreateRequirementDto } from '../dto/requirement/create-requirement.dto';
import { Requirement } from '../entities/Requirement.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { UpdateRequirementDto } from '../dto/requirement/update-requirement.dto';

@Controller('requirements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RequirementController {
  constructor(private readonly requirementService: RequirementService) { }

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
  async findAll(@Req() req, @Query('page') page: number, @Query('limit') limit: number): Promise<{ requirements: Requirement[], total: number }> {
    return this.requirementService.findAll(req.user.id, page, limit);
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
  async update(@Param('id') id: number, @Body() updateRequirementDto: UpdateRequirementDto): Promise<Requirement> {
    return this.requirementService.update(id, updateRequirementDto);
  }
}