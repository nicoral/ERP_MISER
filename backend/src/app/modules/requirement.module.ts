import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequirementController } from '../controllers/requirement.controller';
import { RequirementService } from '../services/requirement.service';
import { Requirement } from '../entities/Requirement.entity';
import { RequirementArticle } from '../entities/RequirementArticle.entity';
import { RequirementService as RequirementServiceEntity } from '../entities/RequirementService.entity';
import { Supplier } from '../entities/Supplier.entity';
import { EmployeeModule } from './employee.module';
import { RoleModule } from './role.module';
import { QuotationModule } from './quotation.module';
import { QRService } from '../services/qr.service';
import { StorageModule } from './storage.module';
import { DocumentApprovalConfigurationModule } from './documentApprovalConfiguration.module';
import { GeneralSettingsModule } from './generalSettings.module';
import { PurchaseOrderModule } from './purchaseOrder.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Requirement,
      RequirementArticle,
      RequirementServiceEntity,
      Supplier,
    ]),
    EmployeeModule,
    RoleModule,
    forwardRef(() => QuotationModule),
    StorageModule,
    DocumentApprovalConfigurationModule,
    GeneralSettingsModule,
    forwardRef(() => PurchaseOrderModule),
  ],
  controllers: [RequirementController],
  providers: [RequirementService, QRService],
  exports: [RequirementService],
})
export class RequirementModule {}
