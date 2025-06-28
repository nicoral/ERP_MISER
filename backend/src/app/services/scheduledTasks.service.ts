import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GeneralSettingsService } from './generalSettings.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    private readonly generalSettingsService: GeneralSettingsService
  ) {}

  /**
   * Actualiza el tipo de cambio diariamente a las 8:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM, {
    name: 'update-exchange-rate',
    timeZone: 'America/Lima',
  })
  async updateExchangeRateDaily() {
    try {
      this.logger.log(
        'Ejecutando tarea programada: Actualización de tipo de cambio'
      );

      const shouldUpdate =
        await this.generalSettingsService.shouldUpdateExchangeRate();

      if (shouldUpdate) {
        await this.generalSettingsService.updateExchangeRate();
        this.logger.log('Tipo de cambio actualizado exitosamente');
      } else {
        this.logger.log('No es necesario actualizar el tipo de cambio');
      }
    } catch (error) {
      this.logger.error(
        `Error en tarea programada de actualización de tipo de cambio: ${error.message}`
      );
    }
  }
}
