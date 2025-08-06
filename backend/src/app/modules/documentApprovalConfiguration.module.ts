import { Module } from '@nestjs/common';
import { DocumentApprovalConfigurationController } from '../controllers/documentApprovalConfiguration.controller';
import { DocumentApprovalConfigurationService } from '../services/documentApprovalConfiguration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentApprovalConfiguration } from '../entities/DocumentApprovalConfiguration.entity';
import { ApprovalFlowTemplate } from '../entities/ApprovalFlowTemplate.entity';
import { GeneralSettingsModule } from './generalSettings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentApprovalConfiguration,
      ApprovalFlowTemplate,
    ]),
    GeneralSettingsModule,
  ],
  controllers: [DocumentApprovalConfigurationController],
  providers: [DocumentApprovalConfigurationService],
  exports: [DocumentApprovalConfigurationService],
})
export class DocumentApprovalConfigurationModule {}
