import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralSettings } from '../entities/GeneralSettings.entity';
import { SunatProvider } from '../providers/sunat.provider';
import { UpdateGeneralSettingsDto } from '../dto/generalSettings/update-generalSettings.dto';
import { ApisNetRUCData } from '../interfaces/generalSettings/apisNet.interface';
import { StorageService } from './storage.service';

@Injectable()
export class GeneralSettingsService {
  private readonly logger = new Logger(GeneralSettingsService.name);

  constructor(
    @InjectRepository(GeneralSettings)
    private readonly generalSettingsRepository: Repository<GeneralSettings>,
    private readonly sunatProvider: SunatProvider,
    private readonly storageService: StorageService
  ) {}

  /**
   * Obtiene las configuraciones generales
   * Si no existen, crea una configuración por defecto
   */
  async getSettings(): Promise<GeneralSettings> {
    let settings = await this.generalSettingsRepository.findOne({
      where: {
        id: 1,
      },
    });

    if (!settings) {
      this.logger.log('Creando configuración general por defecto');
      settings = await this.createDefaultSettings();
    }

    return settings;
  }

  /**
   * Actualiza las configuraciones generales
   */
  async updateSettings(
    updateData: UpdateGeneralSettingsDto
  ): Promise<GeneralSettings> {
    const settings = await this.getSettings();

    Object.assign(settings, updateData);

    return await this.generalSettingsRepository.save(settings);
  }

  /**
   * Actualiza el logo de la empresa
   */
  async updateLogo(file: Express.Multer.File): Promise<GeneralSettings> {
    try {
      const settings = await this.getSettings();

      if (settings.companyLogoUrl) {
        await this.storageService.removeFileByUrl(settings.companyLogoUrl);
      }

      const fileName = `logo-${Date.now()}.${file.originalname.split('.').pop()}`;
      const path = `logos/${fileName}`;
      const uploadResult = await this.storageService.uploadFile(
        path,
        file.buffer,
        file.mimetype
      );

      settings.companyLogoUrl = uploadResult.url;
      const updatedSettings =
        await this.generalSettingsRepository.save(settings);

      return updatedSettings;
    } catch (error) {
      this.logger.error(`Error al actualizar logo: ${error.message}`);
      throw new Error(`No se pudo actualizar el logo: ${error.message}`);
    }
  }

  /**
   * Actualiza el tipo de cambio desde SUNAT
   */
  async updateExchangeRate(): Promise<GeneralSettings> {
    try {
      this.logger.log('Actualizando tipo de cambio desde SUNAT...');

      const exchangeRate = await this.sunatProvider.getExchangeRate();
      const settings = await this.getSettings();

      settings.exchangeRateSale = exchangeRate.saleRate;
      settings.exchangeRatePurchase = exchangeRate.purchaseRate;
      settings.exchangeRateDate = this.sunatProvider.parseDate(
        exchangeRate.date
      );
      settings.exchangeRateDateString = exchangeRate.date;

      const updatedSettings =
        await this.generalSettingsRepository.save(settings);

      this.logger.log(
        `Tipo de cambio actualizado: ${exchangeRate.date} - Venta: ${exchangeRate.saleRate}, Compra: ${exchangeRate.purchaseRate}`
      );

      return updatedSettings;
    } catch (error) {
      this.logger.error(`Error al actualizar tipo de cambio: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene solo el tipo de cambio de venta actual
   */
  async getCurrentSaleRate(): Promise<{
    date: string;
    saleRate: number;
  } | null> {
    const settings = await this.getSettings();

    if (!settings.exchangeRateSale || !settings.exchangeRateDateString) {
      return null;
    }

    return {
      date: settings.exchangeRateDateString,
      saleRate: settings.exchangeRateSale,
    };
  }

  /**
   * Obtiene el tipo de cambio completo actual
   */
  async getCurrentExchangeRate(): Promise<{
    date: string;
    saleRate: number;
    purchaseRate: number;
  } | null> {
    const settings = await this.getSettings();

    if (!settings.exchangeRateSale || !settings.exchangeRateDateString) {
      return null;
    }

    return {
      date: settings.exchangeRateDateString,
      saleRate: settings.exchangeRateSale,
      purchaseRate: settings.exchangeRatePurchase || 0,
    };
  }

  /**
   * Crea una configuración por defecto
   */
  private async createDefaultSettings(): Promise<GeneralSettings> {
    const defaultSettings = new GeneralSettings();
    defaultSettings.companyName = 'MYSER ERP';
    defaultSettings.companyLogoUrl = null;
    defaultSettings.exchangeRateSale = null;
    defaultSettings.exchangeRatePurchase = null;
    defaultSettings.exchangeRateDate = null;
    defaultSettings.exchangeRateDateString = null;
    defaultSettings.exchangeRateAutoUpdate = true;
    defaultSettings.timezone = 'America/Lima';
    defaultSettings.generalTax = 18;
    defaultSettings.additionalSettings = null;

    return await this.generalSettingsRepository.save(defaultSettings);
  }

  /**
   * Verifica si el tipo de cambio necesita actualización
   * (si no hay datos o si la fecha es anterior a hoy)
   */
  async shouldUpdateExchangeRate(): Promise<boolean> {
    const settings = await this.getSettings();

    if (!settings.exchangeRateAutoUpdate) {
      return false;
    }

    if (!settings.exchangeRateDate) {
      return true;
    }

    const today = new Date();
    const exchangeDate = settings.exchangeRateDate;

    // Comparar solo la fecha (sin hora)
    const todayStr = today.toISOString().split('T')[0];
    const exchangeDateStr = new Date(exchangeDate).toISOString().split('T')[0];

    return todayStr !== exchangeDateStr;
  }

  /**
   * Obtiene el umbral de monto bajo para aprobación automática
   */
  async getLowAmountThreshold(): Promise<number> {
    const settings = await this.getSettings();
    return settings.lowAmountThreshold || 10000; // Valor por defecto S/. 10,000
  }

  /**
   * Obtiene el impuesto general
   */
  async getGeneralTax(): Promise<number> {
    const settings = await this.getSettings();
    return settings.generalTax;
  }

  async getRUCData(ruc: string): Promise<ApisNetRUCData> {
    return await this.sunatProvider.getRUCData(ruc);
  }
}
