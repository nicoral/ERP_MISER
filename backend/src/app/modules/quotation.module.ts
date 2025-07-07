import { Module } from '@nestjs/common';
import { QuotationController } from '../controllers/quotation.controller';
import { QuotationService } from '../services/quotation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationRequest } from '../entities/QuotationRequest.entity';
import { QuotationSupplier } from '../entities/QuotationSupplier.entity';
import { QuotationSupplierArticle } from '../entities/QuotationSupplierArticle.entity';
import { SupplierQuotation } from '../entities/SupplierQuotation.entity';
import { SupplierQuotationItem } from '../entities/SupplierQuotationItem.entity';
import { FinalSelection } from '../entities/FinalSelection.entity';
import { FinalSelectionItem } from '../entities/FinalSelectionItem.entity';
import { Supplier } from '../entities/Supplier.entity';
import { RequirementArticle } from '../entities/RequirementArticle.entity';
import { RequirementModule } from './requirement.module';
import { SupplierModule } from './supplier.module';
import { EmployeeModule } from './employee.module';
import { PaymentModule } from './payment.module';
import { QRService } from '../services/qr.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuotationRequest,
      QuotationSupplier,
      QuotationSupplierArticle,
      SupplierQuotation,
      SupplierQuotationItem,
      FinalSelection,
      FinalSelectionItem,
      Supplier,
      RequirementArticle,
    ]),
    RequirementModule,
    SupplierModule,
    EmployeeModule,
    PaymentModule,
  ],
  controllers: [QuotationController],
  providers: [QuotationService, QRService],
  exports: [QuotationService],
})
export class QuotationModule {}
