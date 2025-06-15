import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from '../entities/Supplier.entity';
import { SupplierController } from '../controllers/supplier.controller';
import { SupplierService } from '../services/supplier.service';
import { EmployeeModule } from './employee.module';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier]), EmployeeModule],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
