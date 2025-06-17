import { Module } from '@nestjs/common';
import { RequirementController } from '../controllers/requirement.controller';
import { RequirementService } from '../services/requirement.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requirement } from '../entities/Requirement.entity';
import { RequirementArticle } from '../entities/RequirementArticle.entity';
import { EmployeeModule } from './employee.module';

@Module({
  imports: [TypeOrmModule.forFeature([Requirement, RequirementArticle]), EmployeeModule],
  controllers: [RequirementController],
  providers: [RequirementService],
  exports: [RequirementService],
})
export class RequirementModule { }