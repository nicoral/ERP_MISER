import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Post,
  Logger,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GeneralSettingsService } from '../services/generalSettings.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { UpdateGeneralSettingsDto } from '../dto/generalSettings/update-generalSettings.dto';
import { AuditDescription } from '../common/decorators/audit-description.decorator';

@Controller('general-settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GeneralSettingsController {
  private readonly logger = new Logger(GeneralSettingsController.name);

  constructor(
    private readonly generalSettingsService: GeneralSettingsService
  ) {}

  @Get()
  //@RequirePermissions('read:settings')
  @AuditDescription('Consulta de configuración general')
  async getSettings() {
    return await this.generalSettingsService.getSettings();
  }

  @Put()
  //@RequirePermissions('update:settings')
  @AuditDescription('Actualización de configuración general')
  async updateSettings(@Body() updateData: UpdateGeneralSettingsDto) {
    return await this.generalSettingsService.updateSettings(updateData);
  }

  @Post('logo')
  //@RequirePermissions('update:settings')
  @UseInterceptors(FileInterceptor('file'))
  @AuditDescription('Actualización de logo de la empresa')
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    this.logger.log('Solicitud de actualización de logo de la empresa');
    return await this.generalSettingsService.updateLogo(file);
  }

  @Get('exchange-rate')
  @AuditDescription('Consulta de tipo de cambio')
  async getCurrentExchangeRate() {
    return await this.generalSettingsService.getCurrentExchangeRate();
  }

  @Get('exchange-rate/sale')
  @AuditDescription('Consulta de tipo de cambio de venta')
  async getCurrentSaleRate() {
    return await this.generalSettingsService.getCurrentSaleRate();
  }

  @Post('exchange-rate/update')
  @AuditDescription('Actualización manual de tipo de cambio')
  async updateExchangeRate() {
    this.logger.log('Solicitud manual de actualización de tipo de cambio');
    return await this.generalSettingsService.updateExchangeRate();
  }

  @Get('exchange-rate/should-update')
  @AuditDescription('Verificación de actualización de tipo de cambio')
  async shouldUpdateExchangeRate() {
    return {
      shouldUpdate:
        await this.generalSettingsService.shouldUpdateExchangeRate(),
    };
  }

  @Get('general-tax')
  @AuditDescription('Consulta de impuesto general')
  async getGeneralTax() {
    return await this.generalSettingsService.getGeneralTax();
  }
}
