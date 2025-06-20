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
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/role/create-role.dto';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { UpdateRoleDto } from '../dto/role/update-role.dto';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RequirePermissions('create_roles')
  @AuditDescription('Creación de nuevo rol')
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions('view_roles')
  @AuditDescription('Consulta de lista de roles')
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @RequirePermissions('view_roles')
  @AuditDescription('Consulta de detalle de rol')
  async findById(@Param('id') id: number) {
    return this.roleService.findById(id);
  }

  @Get('graph/distribution')
  @RequirePermissions('view_roles')
  @AuditDescription('Consulta de distribución de roles')
  async findDistribution() {
    return this.roleService.findDistribution();
  }

  @Put(':id')
  @RequirePermissions('update_roles')
  @AuditDescription('Actualización de rol')
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions('delete_roles')
  @AuditDescription('Eliminación de rol')
  async remove(@Param('id') id: number) {
    return this.roleService.remove(id);
  }
}
