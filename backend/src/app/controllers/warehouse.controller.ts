import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WarehouseService } from '../services/warehouse.service';
import { Warehouse } from '../entities/Warehouse.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { CreateWarehouseDto } from '../dto/warehouse/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/warehouse/update-warehouse.dto';
import { AuditDescription } from '../common/decorators/audit-description.decorator';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  @RequirePermissions('view_warehouses')
  @AuditDescription('Consulta de lista de almacenes')
  async getWarehouses(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string
  ): Promise<{
    data: Warehouse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { data, total } = await this.warehouseService.getWarehouses(
      page,
      limit,
      search
    );
    return { data, total, page, limit };
  }

  @Get(':id')
  @RequirePermissions('view_warehouses')
  @AuditDescription('Consulta de detalle de almacén')
  async getWarehouseById(@Param('id') id: number): Promise<Warehouse> {
    return this.warehouseService.getWarehouseById(id);
  }

  @Post()
  @RequirePermissions('create_warehouse')
  @AuditDescription('Creación de nuevo almacén')
  async createWarehouse(
    @Body() warehouse: CreateWarehouseDto
  ): Promise<Warehouse> {
    return this.warehouseService.createWarehouse(warehouse);
  }

  @Put(':id')
  @RequirePermissions('update_warehouse')
  @AuditDescription('Actualización de almacén')
  async updateWarehouse(
    @Param('id') id: number,
    @Body() warehouse: UpdateWarehouseDto
  ): Promise<Warehouse> {
    return this.warehouseService.updateWarehouse(id, warehouse);
  }

  @Delete(':id')
  @RequirePermissions('delete_warehouse')
  @AuditDescription('Eliminación de almacén')
  async deleteWarehouse(@Param('id') id: number): Promise<void> {
    return this.warehouseService.deleteWarehouse(id);
  }
}
