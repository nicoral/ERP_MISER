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
import { CreatePermissionDto } from '../dto/permissions/create-permission.dto';
import { UpdatePermissionDto } from '../dto/permissions/update-permission.dto';
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

  @Get(':id')
  @Roles(1)
  @AuditDescription('Consulta de permiso específico')
  async findOne(@Param('id') id: string) {
    return this.permissionService.findById(parseInt(id));
  }

  @Put(':id')
  @Roles(1)
  @AuditDescription('Actualización de permiso')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto
  ) {
    return this.permissionService.update(parseInt(id), updatePermissionDto);
  }

  @Delete(':id')
  @Roles(1)
  @AuditDescription('Eliminación de permiso')
  async remove(@Param('id') id: string) {
    return this.permissionService.delete(parseInt(id));
  }

  @Get('module/:module')
  @Roles(1)
  @AuditDescription('Consulta de permisos por módulo')
  async findByModule(@Param('module') module: string) {
    return this.permissionService.findByModule(module);
  }

  @Get('role/:roleId')
  @Roles(1)
  @AuditDescription('Consulta de permisos por rol')
  async findByRole(@Param('roleId') roleId: string) {
    return this.permissionService.findByRole(parseInt(roleId));
  }
}
