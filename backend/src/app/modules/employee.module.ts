import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../entities/Employee.entity';
import { EmployeeController } from '../controllers/employee.controller';
import { EmployeeService } from '../services/employee.service';
import { RoleModule } from './role.module';
import { StorageModule } from './storage.module';
import { ExcelImportModule } from './excel-import.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    forwardRef(() => RoleModule),
    StorageModule,
    ExcelImportModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
