import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { forRootObject } from './config/configModuleOptions';
import { DatabaseModule } from './config/database/database.module';
import { EmployeeModule } from './app/modules/employee.module';
import { AuthModule } from './app/modules/auth/auth.module';
import { PermissionModule } from './app/modules/permission.module';
import { RoleModule } from './app/modules/role.module';
import { WarehouseModule } from './app/modules/warehouse.module';
import { ArticleModule } from './app/modules/article.module';
import { SupplierModule } from './app/modules/supplier.module';
import { QuotationModule } from './app/modules/quotation.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './app/common/audit.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './app/entities/AuditLog.entity';
import { Employee } from './app/entities/Employee.entity';
import { CloudinaryModule } from './app/modules/cloudinary.module';
import { AuditLogModule } from './app/modules/auditLog.module';
import { CostCenterModule } from './app/modules/costCenter.module';
import { RequirementModule } from './app/modules/requirement.module';
import { SunatModule } from './app/modules/sunat.module';
import { GeneralSettingsModule } from './app/modules/generalSettings.module';
import { ScheduledTasksService } from './app/services/scheduledTasks.service';
import { TestModule } from './app/modules/test.module';
import { ServiceModule } from './app/modules/service.module';
import { PaymentModule } from './app/modules/payment.module';
import { PurchaseOrderModule } from './app/modules/purchaseOrder.module';

@Module({
  imports: [
    ConfigModule.forRoot(forRootObject),
    ScheduleModule.forRoot(),
    CloudinaryModule,
    DatabaseModule,
    PermissionModule,
    EmployeeModule,
    RoleModule,
    AuthModule,
    WarehouseModule,
    ArticleModule,
    SupplierModule,
    QuotationModule,
    AuditLogModule,
    CostCenterModule,
    RequirementModule,
    SunatModule,
    GeneralSettingsModule,
    TestModule,
    ServiceModule,
    PaymentModule,
    PurchaseOrderModule,
    TypeOrmModule.forFeature([AuditLog, Employee]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    ScheduledTasksService,
  ],
})
export class AppModule {}
