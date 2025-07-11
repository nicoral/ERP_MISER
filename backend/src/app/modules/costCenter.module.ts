import { Module } from '@nestjs/common';
import { CostCenterController } from '../controllers/costCenter.controller';
import { CostCenterService } from '../services/costCenter.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostCenter } from '../entities/CostCenter.entity';
import { EmployeeModule } from './employee.module';
import { ExcelImportModule } from './excel-import.module';

@Module({
  imports: [TypeOrmModule.forFeature([CostCenter]), EmployeeModule, ExcelImportModule],
  controllers: [CostCenterController],
  providers: [CostCenterService],
  exports: [CostCenterService],
})
export class CostCenterModule {}
