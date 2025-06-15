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

@Controller('suppliers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @RequirePermissions('create_suppliers')
  create(@Body() createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  @RequirePermissions('view_suppliers')
  findAll(
    @Query() query: { page: number; limit: number; search: string },
  ): Promise<{ data: Supplier[]; total: number }> {
    return this.supplierService.findAll(query.page, query.limit, query.search);
  }

  @Get(':id')
  @RequirePermissions('view_suppliers')
  findOne(@Param('id') id: number): Promise<Supplier> {
    return this.supplierService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('update_suppliers')
  update(
    @Param('id') id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @RequirePermissions('delete_suppliers')
  remove(@Param('id') id: number): Promise<void> {
    return this.supplierService.remove(id);
  }
}
