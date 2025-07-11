import { Injectable, Logger } from '@nestjs/common';
import { ApisNetRUCData } from '../interfaces/generalSettings/apisNet.interface';

export interface SunatExchangeRate {
  date: string;
  saleRate: number;
  purchaseRate: number;
}

@Injectable()
export class SunatProvider {
  private readonly logger = new Logger(SunatProvider.name);
  private readonly SUNAT_API_URL =
    'https://www.sunat.gob.pe/a/txt/tipoCambio.txt';

  /**
   * Obtiene el tipo de cambio actual desde la API de SUNAT
   * @returns Promise<SunatExchangeRate> - Objeto con fecha y tipos de cambio
   */
  async getExchangeRate(): Promise<SunatExchangeRate> {
    try {
      this.logger.log('Obteniendo tipo de cambio desde SUNAT...');

      const response = await fetch(this.SUNAT_API_URL, {
        method: 'GET',
        headers: {
          'User-Agent': 'MISER-ERP/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status} ${response.statusText}`
        );
      }

      const text = await response.text();
      this.logger.debug(`Respuesta de SUNAT: ${text}`);

      // Parsear la respuesta: formato "25/06/2025|3.571|3.581|"
      const parts = text.trim().split('|');

      if (parts.length < 3) {
        throw new Error('Formato de respuesta inválido de SUNAT');
      }

      const [dateStr, purchaseRateStr, saleRateStr] = parts;

      // Validar que los valores sean números válidos
      const purchaseRate = parseFloat(purchaseRateStr);
      const saleRate = parseFloat(saleRateStr);

      if (isNaN(purchaseRate) || isNaN(saleRate)) {
        throw new Error('Valores de tipo de cambio inválidos');
      }

      // Validar formato de fecha (DD/MM/YYYY)
      if (!this.isValidDateFormat(dateStr)) {
        throw new Error('Formato de fecha inválido');
      }

      const result: SunatExchangeRate = {
        date: dateStr,
        purchaseRate,
        saleRate,
      };

      this.logger.log(
        `Tipo de cambio obtenido: ${dateStr} - Compra: ${purchaseRate}, Venta: ${saleRate}`
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error al obtener tipo de cambio de SUNAT: ${error.message}`
      );
      throw new Error(`No se pudo obtener el tipo de cambio: ${error.message}`);
    }
  }

  /**
   * Obtiene solo la fecha y el tipo de cambio de venta
   * @returns Promise<{date: string, saleRate: number}>
   */
  async getSaleRate(): Promise<{ date: string; saleRate: number }> {
    const exchangeRate = await this.getExchangeRate();
    return {
      date: exchangeRate.date,
      saleRate: exchangeRate.saleRate,
    };
  }

  /**
   * Valida el formato de fecha DD/MM/YYYY
   * @param dateStr - String de fecha a validar
   * @returns boolean - true si el formato es válido
   */
  private isValidDateFormat(dateStr: string): boolean {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dateStr)) {
      return false;
    }

    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  }

  /**
   * Convierte la fecha de formato DD/MM/YYYY a YYYY-MM-DD
   * @param dateStr - Fecha en formato DD/MM/YYYY
   * @returns string - Fecha en formato YYYY-MM-DD
   */
  formatDateToISO(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  /**
   * Convierte la fecha de formato DD/MM/YYYY a objeto Date
   * @param dateStr - Fecha en formato DD/MM/YYYY
   * @returns Date - Objeto Date
   */
  parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  async getRUCData(ruc: string): Promise<ApisNetRUCData> {
    const response = await fetch(`https://api.apis.net.pe/v2/sunat/ruc?numero=${ruc}`, {
      method: 'GET',
      headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.APIS_NET_TOKEN}`,
      },
    });

    return response.json() as Promise<ApisNetRUCData>;
  }
}
