import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../entities/Employee.entity';
import { EmployeeController } from '../controllers/employee.controller';
import { EmployeeService } from '../services/employee.service';
import { RoleModule } from './role.module';
import { CloudinaryModule } from './cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), RoleModule, CloudinaryModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
