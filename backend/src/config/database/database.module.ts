import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { options } from './dataSource';
import { Employee } from '../../app/entities/Employee.entity';
import { Role } from '../../app/entities/Role.entity';
import { Permission } from '../../app/entities/Permission.entity';
import { Warehouse } from '../../app/entities/Warehouse.entity';
import { WarehouseArticle } from '../../app/entities/WarehouseArticle.entity';
import { Article } from '../../app/entities/Article.entity';
import { Supplier } from '../../app/entities/Supplier.entity';
import { AuditLog } from '../../app/entities/AuditLog.entity';
import { Brand } from '../../app/entities/Brand.entity';
import { CostCenter } from '../../app/entities/CostCenter.entity';
import { RequirementArticle } from '../../app/entities/RequirementArticle.entity';
import { Requirement } from '../../app/entities/Requirement.entity';
import { GeneralSettings } from '../../app/entities/GeneralSettings.entity';
import { QuotationRequest } from '../../app/entities/QuotationRequest.entity';
import { QuotationSupplier } from '../../app/entities/QuotationSupplier.entity';
import { QuotationSupplierArticle } from '../../app/entities/QuotationSupplierArticle.entity';
import { QuotationSupplierService } from '../../app/entities/QuotationSupplierService.entity';
import { SupplierQuotation } from '../../app/entities/SupplierQuotation.entity';
import { SupplierQuotationItem } from '../../app/entities/SupplierQuotationItem.entity';
import { SupplierQuotationServiceItem } from '../../app/entities/SupplierQuotationServiceItem.entity';
import { FinalSelection } from '../../app/entities/FinalSelection.entity';
import { FinalSelectionItem } from '../../app/entities/FinalSelectionItem.entity';
import { FinalSelectionServiceItem } from '../../app/entities/FinalSelectionServiceItem.entity';
import { Service } from '../../app/entities/Service.entity';
import { RequirementService } from '../../app/entities/RequirementService.entity';
import { PaymentDetail } from '../../app/entities/PaymentDetail.entity';
import { PurchaseOrder } from '../../app/entities/PurchaseOrder.entity';
import { PaymentGroup } from '../../app/entities/PaymentGroup.entity';
import { EntryPart } from '../../app/entities/EntryPart.entity';
import { EntryPartArticle } from '../../app/entities/EntryPartArticle.entity';
import { ExitPart } from '../../app/entities/ExitPart.entity';
import { ExitPartArticle } from '../../app/entities/ExitPartArticle.entity';
import { EntryPartService } from '../../app/entities/EntryPartService.entity';
import { WarehouseFuelStock } from '../../app/entities/WarehouseFuelStock.entity';
import { FuelDailyControl } from '../../app/entities/FuelDailyControl.entity';
import { FuelOutput } from '../../app/entities/FuelOutput.entity';
import { FuelStockMovement } from '../../app/entities/FuelStockMovement.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...options,
      entities: [
        Employee,
        Role,
        Permission,
        Warehouse,
        Article,
        Supplier,
        WarehouseArticle,
        AuditLog,
        Brand,
        CostCenter,
        Requirement,
        RequirementArticle,
        GeneralSettings,
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
        Service,
        RequirementService,
        PaymentGroup,
        PaymentDetail,
        PurchaseOrder,
        EntryPart,
        EntryPartArticle,
        EntryPartService,
        ExitPart,
        ExitPartArticle,
        WarehouseFuelStock,
        FuelDailyControl,
        FuelOutput,
        FuelStockMovement,
      ],
    }),
  ],
  providers: [
    {
      provide: DataSource,
      useFactory: () => {
        return new DataSource(options);
      },
    },
  ],
  exports: [TypeOrmModule, DataSource],
})
export class DatabaseModule {}
