import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationController } from '../controllers/quotation.controller';
import { QuotationService } from '../services/quotation.service';
import { QuotationRequest } from '../entities/QuotationRequest.entity';
import { QuotationSupplier } from '../entities/QuotationSupplier.entity';
import { QuotationSupplierArticle } from '../entities/QuotationSupplierArticle.entity';
import { QuotationSupplierService } from '../entities/QuotationSupplierService.entity';
import { SupplierQuotation } from '../entities/SupplierQuotation.entity';
import { SupplierQuotationItem } from '../entities/SupplierQuotationItem.entity';
import { SupplierQuotationServiceItem } from '../entities/SupplierQuotationServiceItem.entity';
import { FinalSelection } from '../entities/FinalSelection.entity';
import { FinalSelectionItem } from '../entities/FinalSelectionItem.entity';
import { FinalSelectionServiceItem } from '../entities/FinalSelectionServiceItem.entity';
import { RequirementArticle } from '../entities/RequirementArticle.entity';
import { RequirementService as RequirementServiceEntity } from '../entities/RequirementService.entity';
import { RequirementModule } from './requirement.module';
import { SupplierModule } from './supplier.module';
import { PurchaseOrderModule } from './purchaseOrder.module';
import { QRService } from '../services/qr.service';
import { StorageModule } from './storage.module';
import { DocumentApprovalConfigurationModule } from './documentApprovalConfiguration.module';
import { GeneralSettingsModule } from './generalSettings.module';
import { EmployeeModule } from './employee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuotationRequest,
      QuotationSupplier,
      QuotationSupplierArticle,
      QuotationSupplierService,
      SupplierQuotation,
      SupplierQuotationItem,
      SupplierQuotationServiceItem,
      FinalSelection,
      FinalSelectionItem,
      FinalSelectionServiceItem,
      RequirementArticle,
      RequirementServiceEntity,
    ]),
    forwardRef(() => RequirementModule),
    SupplierModule,
    PurchaseOrderModule,
    StorageModule,
    EmployeeModule,
    DocumentApprovalConfigurationModule,
    GeneralSettingsModule,
  ],
  controllers: [QuotationController],
  providers: [QuotationService, QRService],
  exports: [QuotationService],
})
export class QuotationModule {}
