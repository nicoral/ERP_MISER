import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../entities/Service.entity';
import { ServiceController } from '../controllers/service.controller';
import { ServiceService } from '../services/service.service';
import { EmployeeModule } from './employee.module';

@Module({
  imports: [TypeOrmModule.forFeature([Service]), EmployeeModule],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
