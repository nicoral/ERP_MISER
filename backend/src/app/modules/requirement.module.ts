import { Module, forwardRef } from '@nestjs/common';
import { RequirementController } from '../controllers/requirement.controller';
import { RequirementService } from '../services/requirement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requirement } from '../entities/Requirement.entity';
import { RequirementArticle } from '../entities/RequirementArticle.entity';
import { RequirementService as RequirementServiceEntity } from '../entities/RequirementService.entity';
import { EmployeeModule } from './employee.module';
import { RoleModule } from './role.module';
import { QuotationModule } from './quotation.module';
import { QRService } from '../services/qr.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Requirement,
      RequirementArticle,
      RequirementServiceEntity,
    ]),
    EmployeeModule,
    RoleModule,
    forwardRef(() => QuotationModule),
  ],
  controllers: [RequirementController],
  providers: [RequirementService, QRService],
  exports: [RequirementService],
})
export class RequirementModule {}
