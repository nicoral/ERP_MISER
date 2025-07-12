import { Module } from '@nestjs/common';
import { QuotationController } from '../controllers/quotation.controller';
import { QuotationService } from '../services/quotation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { Supplier } from '../entities/Supplier.entity';
import { RequirementArticle } from '../entities/RequirementArticle.entity';
import { RequirementService } from '../entities/RequirementService.entity';
import { RequirementModule } from './requirement.module';
import { SupplierModule } from './supplier.module';
import { EmployeeModule } from './employee.module';
import { PurchaseOrderModule } from './purchaseOrder.module';
import { QRService } from '../services/qr.service';
import { GeneralSettingsModule } from './generalSettings.module';

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
      Supplier,
      RequirementArticle,
      RequirementService,
    ]),
    RequirementModule,
    SupplierModule,
    EmployeeModule,
    PurchaseOrderModule,
    GeneralSettingsModule,
  ],
  controllers: [QuotationController],
  providers: [QuotationService, QRService],
  exports: [QuotationService],
})
export class QuotationModule {}
