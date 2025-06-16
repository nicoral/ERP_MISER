import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CreatePermissionDto } from '../dto/permissions/create-permission.dto';
import { PermissionService } from '../services/permission.service';
import { AuditDescription } from '../common/decorators/audit-description.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Roles(1)
  @AuditDescription('Creación de nuevo permiso')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @Roles(1)
  @AuditDescription('Consulta de lista de permisos')
  async findAll() {
    return this.permissionService.findAll();
  }
}
