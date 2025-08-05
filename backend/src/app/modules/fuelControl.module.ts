import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelControlController } from '../controllers/fuelControl.controller';
import { FuelControlService } from '../services/fuelControl.service';
import { FuelDailyControl } from '../entities/FuelDailyControl.entity';
import { FuelOutput } from '../entities/FuelOutput.entity';
import { WarehouseFuelStock } from '../entities/WarehouseFuelStock.entity';
import { EmployeeModule } from './employee.module';
import { RoleModule } from './role.module';
import { QRService } from '../services/qr.service';
import { StorageModule } from './storage.module';
import { DocumentApprovalConfigurationModule } from './documentApprovalConfiguration.module';
import { FuelStockMovement } from '../entities/FuelStockMovement.entity';
import { GeneralSettingsModule } from './generalSettings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FuelDailyControl,
      FuelOutput,
      WarehouseFuelStock,
      FuelStockMovement,
    ]),
    EmployeeModule,
    RoleModule,
    StorageModule,
    DocumentApprovalConfigurationModule,
    GeneralSettingsModule,
  ],
  controllers: [FuelControlController],
  providers: [FuelControlService, QRService],
  exports: [FuelControlService],
})
export class FuelControlModule {}
