import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities/Role.entity';
import { RoleController } from '../controllers/role.controller';
import { RoleService } from '../services/role.service';
import { PermissionModule } from './permission.module';
import { EmployeeModule } from './employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    PermissionModule,
    forwardRef(() => EmployeeModule),
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
