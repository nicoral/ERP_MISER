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
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { UpdateRoleDto } from '../dto/role/update-role.dto';

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

  @Put(':id')
  @Roles(1)
  @AuditDescription('Actualización de rol')
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }
}
