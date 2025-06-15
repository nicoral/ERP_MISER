import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from '../entities/Warehouse.entity';
import { WarehouseService } from '../services/warehouse.service';
import { WarehouseController } from '../controllers/warehouse.controller';
import { EmployeeModule } from './employee.module';
import { WarehouseArticle } from '../entities/WarehouseArticle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse, WarehouseArticle]),
    EmployeeModule,
  ],
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
