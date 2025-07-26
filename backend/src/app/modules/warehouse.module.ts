import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from '../entities/Warehouse.entity';
import { WarehouseArticle } from '../entities/WarehouseArticle.entity';
import { WarehouseFuelStock } from '../entities/WarehouseFuelStock.entity';
import { WarehouseService } from '../services/warehouse.service';
import { WarehouseController } from '../controllers/warehouse.controller';
import { EmployeeModule } from './employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse, WarehouseArticle, WarehouseFuelStock]),
    EmployeeModule,
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
