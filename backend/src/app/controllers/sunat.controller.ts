import { Controller, Get, Logger } from '@nestjs/common';
import { SunatProvider } from '../providers/sunat.provider';

@Controller('sunat')
export class SunatController {
  private readonly logger = new Logger(SunatController.name);

  constructor(private readonly sunatProvider: SunatProvider) {}

  @Get('exchange-rate')
  async getExchangeRate() {
    return await this.sunatProvider.getExchangeRate();
  }

  @Get('exchange-rate/sale')
  async getSaleRate() {
    return await this.sunatProvider.getSaleRate();
  }
}
