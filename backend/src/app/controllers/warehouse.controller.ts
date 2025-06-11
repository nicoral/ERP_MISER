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

@Controller('warehouses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  @RequirePermissions('view_warehouses')
  async getWarehouses(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<{
    data: Warehouse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { data, total } = await this.warehouseService.getWarehouses(
      page,
      limit,
      search,
    );
    return { data, total, page, limit };
  }

  @Get(':id')
  @RequirePermissions('view_warehouses')
  async getWarehouseById(@Param('id') id: number): Promise<Warehouse> {
    return this.warehouseService.getWarehouseById(id);
  }

  @Post()
  @RequirePermissions('create_warehouse')
  async createWarehouse(
    @Body() warehouse: CreateWarehouseDto,
  ): Promise<Warehouse> {
    return this.warehouseService.createWarehouse(warehouse);
  }

  @Put(':id')
  @RequirePermissions('update_warehouse')
  async updateWarehouse(
    @Param('id') id: number,
    @Body() warehouse: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    return this.warehouseService.updateWarehouse(id, warehouse);
  }

  @Delete(':id')
  @RequirePermissions('delete_warehouse')
  async deleteWarehouse(@Param('id') id: number): Promise<void> {
    return this.warehouseService.deleteWarehouse(id);
  }
}
