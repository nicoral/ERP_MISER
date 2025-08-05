import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentApprovalConfigurationService } from '../services/documentApprovalConfiguration.service';
import { DocumentApprovalConfigurationController } from '../controllers/documentApprovalConfiguration.controller';
import { DocumentApprovalConfiguration } from '../entities/DocumentApprovalConfiguration.entity';
import { ApprovalFlowTemplate } from '../entities/ApprovalFlowTemplate.entity';
import { EmployeeModule } from './employee.module';
import { GeneralSettingsModule } from './generalSettings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentApprovalConfiguration,
      ApprovalFlowTemplate,
    ]),
    EmployeeModule,
    GeneralSettingsModule,
  ],
  controllers: [DocumentApprovalConfigurationController],
  providers: [DocumentApprovalConfigurationService],
  exports: [DocumentApprovalConfigurationService],
})
export class DocumentApprovalConfigurationModule {}
