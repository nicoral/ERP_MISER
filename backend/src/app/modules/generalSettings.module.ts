import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralSettings } from '../entities/GeneralSettings.entity';
import { GeneralSettingsService } from '../services/generalSettings.service';
import { GeneralSettingsController } from '../controllers/generalSettings.controller';
import { SunatModule } from './sunat.module';
import { EmployeeModule } from './employee.module';
import { StorageModule } from './storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneralSettings]),
    EmployeeModule,
    StorageModule,
    SunatModule,
  ],
  controllers: [GeneralSettingsController],
  providers: [GeneralSettingsService],
  exports: [GeneralSettingsService],
})
export class GeneralSettingsModule {}
