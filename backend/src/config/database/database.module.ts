import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
import { SupplierQuotation } from '../../app/entities/SupplierQuotation.entity';
import { SupplierQuotationItem } from '../../app/entities/SupplierQuotationItem.entity';
import { FinalSelection } from '../../app/entities/FinalSelection.entity';
import { FinalSelectionItem } from '../../app/entities/FinalSelectionItem.entity';
import { Service } from '../../app/entities/Service.entity';
import { RequirementService } from '../../app/entities/RequirementService.entity';

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
        SupplierQuotation,
        SupplierQuotationItem,
        FinalSelection,
        FinalSelectionItem,
        Service,
        RequirementService,
      ],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
