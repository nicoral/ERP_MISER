import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { SupplierService } from '../services/supplier.service';
import { CreateSupplierDto } from '../dto/supplier/create-supplier.dto';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Supplier } from '../entities/Supplier.entity';
import { UpdateSupplierDto } from '../dto/supplier/update-supplier.dto';
import { AuditDescription } from '../common/decorators/audit-description.decorator';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @RequirePermissions('create_suppliers')
  @AuditDescription('Creación de nuevo proveedor')
  create(@Body() createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  @RequirePermissions('view_suppliers')
  @AuditDescription('Consulta de lista de proveedores')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string
  ) {
    const { data, total } = await this.supplierService.findAll(
      page,
      limit,
      search
    );
    return { data, total, page, limit };
  }

  @Get(':id')
  @RequirePermissions('view_suppliers')
  @AuditDescription('Consulta de detalle de proveedor')
  findOne(@Param('id') id: number): Promise<Supplier> {
    return this.supplierService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('update_suppliers')
  @AuditDescription('Actualización de proveedor')
  update(
    @Param('id') id: number,
    @Body() updateSupplierDto: UpdateSupplierDto
  ): Promise<Supplier> {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @RequirePermissions('delete_suppliers')
  @AuditDescription('Eliminación de proveedor')
  remove(@Param('id') id: number): Promise<void> {
    return this.supplierService.remove(id);
  }
}
