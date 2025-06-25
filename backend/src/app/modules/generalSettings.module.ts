import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralSettings } from '../entities/GeneralSettings.entity';
import { GeneralSettingsService } from '../services/generalSettings.service';
import { GeneralSettingsController } from '../controllers/generalSettings.controller';
import { SunatModule } from './sunat.module';
import { EmployeeModule } from './employee.module';
import { CloudinaryModule } from './cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneralSettings]),
    EmployeeModule,
    CloudinaryModule,
    SunatModule,
  ],
  controllers: [GeneralSettingsController],
  providers: [GeneralSettingsService],
  exports: [GeneralSettingsService],
})
export class GeneralSettingsModule {} 