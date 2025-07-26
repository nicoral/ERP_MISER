import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelDailyControl } from '../entities/FuelDailyControl.entity';
import { FuelOutput } from '../entities/FuelOutput.entity';
import { FuelStockMovement } from '../entities/FuelStockMovement.entity';
import { WarehouseFuelStock } from '../entities/WarehouseFuelStock.entity';
import { FuelControlService } from '../services/fuelControl.service';
import { FuelControlController } from '../controllers/fuelControl.controller';
import { EmployeeModule } from './employee.module';
import { RoleModule } from './role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FuelDailyControl,
      FuelOutput,
      FuelStockMovement,
      WarehouseFuelStock,
    ]),
    EmployeeModule,
    RoleModule,
  ],
  controllers: [FuelControlController],
  providers: [FuelControlService],
  exports: [FuelControlService],
})
export class FuelControlModule {} 