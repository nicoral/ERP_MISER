import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ServiceService } from '../services/service.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Service } from '../entities/Service.entity';
import { CreateServiceDto } from '../dto/service/create-service.dto';
import { UpdateServiceDto } from '../dto/service/update-service.dto';

@Controller('services')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @RequirePermissions('view_services')
  @AuditDescription('Consulta de servicios')
  async findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string
  ): Promise<{ data: Service[]; total: number }> {
    return this.serviceService.findAll(page, limit, search);
  }

  @Post()
  @RequirePermissions('create_service')
  @AuditDescription('Creación de servicio')
  async create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
    return this.serviceService.create(createServiceDto);
  }

  @Put(':id')
  @RequirePermissions('update_service')
  @AuditDescription('Actualización de servicio')
  async update(@Param('id') id: number, @Body() updateServiceDto: UpdateServiceDto): Promise<Service> {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Delete(':id')
  @RequirePermissions('delete_service')
  @AuditDescription('Eliminación de servicio')
  async remove(@Param('id') id: number): Promise<void> {
    return this.serviceService.remove(id);
  }

  @Get(':id')
  @RequirePermissions('view_services')
  @AuditDescription('Consulta de servicio')
  async findOne(@Param('id') id: number): Promise<Service> {
    return this.serviceService.findOne(id);
  }
}