import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { forRootObject } from './config/configModuleOptions';
import { DatabaseModule } from './config/database/database.module';
import { EmployeeModule } from './app/modules/employee.module';
import { AuthModule } from './app/modules/auth/auth.module';
import { PermissionModule } from './app/modules/permission.module';
import { RoleModule } from './app/modules/role.module';
import { WarehouseModule } from './app/modules/warehouse.module';

@Module({
  imports: [
    ConfigModule.forRoot(forRootObject),
    DatabaseModule,
    PermissionModule,
    RoleModule,
    EmployeeModule,
    AuthModule,
    WarehouseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
