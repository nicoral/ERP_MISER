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
      ],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
