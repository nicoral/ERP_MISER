import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/role/create-role.dto';
import { UpdatePermissionsDto } from '../dto/permissions/update-permissions.dto';
import { AuditDescription } from '../common/decorators/audit-description.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Roles(1) // Solo admin puede crear roles
  @AuditDescription('Creación de nuevo rol')
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @AuditDescription('Consulta de lista de roles')
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Roles(1)
  @AuditDescription('Consulta de detalle de rol')
  async findById(@Param('id') id: number) {
    return this.roleService.findById(id);
  }

  @Put(':id/permissions')
  @Roles(1)
  @AuditDescription('Actualización de permisos de rol')
  async updatePermissions(
    @Param('id') id: number,
    @Body() updatePermissionsDto: UpdatePermissionsDto
  ) {
    return this.roleService.updatePermissions(id, updatePermissionsDto);
  }
}
