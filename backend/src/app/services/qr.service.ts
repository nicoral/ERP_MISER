import { Injectable } from '@nestjs/common';
import { toDataURL, toBuffer, toString } from 'qrcode';

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  width?: number;
  color?: {
    dark: string;
    light: string;
  };
}

interface QRData {
  type: 'requirement' | 'quotation' | 'payment';
  id: string;
  timestamp: number;
  version: string;
}

@Injectable()
export class QRService {
  /**
   * Genera un código QR como DataURL (optimizado para PDFs)
   */
  async generateQRCode(data: string, options?: QRCodeOptions): Promise<string> {
    const defaultOptions: QRCodeOptions = {
      errorCorrectionLevel: 'M', // Nivel medio de corrección de errores
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const result = await toDataURL(data, finalOptions);
      return result;
    } catch (error) {
      throw new Error(`Error generando QR code: ${error.message}`);
    }
  }

  /**
   * Genera un código QR como Buffer (para almacenamiento)
   */
  async generateQRCodeBuffer(
    data: string,
    options?: QRCodeOptions
  ): Promise<Buffer> {
    const defaultOptions: QRCodeOptions = {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      return await toBuffer(data, finalOptions);
    } catch (error) {
      throw new Error(`Error generando QR code buffer: ${error.message}`);
    }
  }

  /**
   * Genera un código QR como SVG (escalable)
   */
  async generateQRCodeSVG(
    data: string,
    options?: QRCodeOptions
  ): Promise<string> {
    const defaultOptions: QRCodeOptions = {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      return await toString(data, {
        type: 'svg',
        ...finalOptions,
      });
    } catch (error) {
      throw new Error(`Error generando QR code SVG: ${error.message}`);
    }
  }

  /**
   * Genera URL para requerimientos
   */
  generateRequirementURL(
    requirementId: number,
    options?: {
      includeTimestamp?: boolean;
      includeVersion?: boolean;
      version?: string;
    }
  ): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    let url = `${baseUrl}/requirements/${requirementId}/details`;

    const params = new URLSearchParams();

    if (options?.includeTimestamp) {
      params.append('t', Date.now().toString());
    }

    if (options?.includeVersion && options?.version) {
      params.append('v', options.version);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Genera URL para cotizaciones
   */
  generateQuotationURL(
    quotationId: number,
    options?: {
      includeTimestamp?: boolean;
      includeVersion?: boolean;
      version?: string;
    }
  ): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    let url = `${baseUrl}/quotations/${quotationId}/details`;

    const params = new URLSearchParams();

    if (options?.includeTimestamp) {
      params.append('t', Date.now().toString());
    }

    if (options?.includeVersion && options?.version) {
      params.append('v', options.version);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  generatePurchaseOrderURL(
    purchaseOrderId: number,
    options?: {
      includeTimestamp?: boolean;
      includeVersion?: boolean;
      version?: string;
    }
  ): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    let url = `${baseUrl}/purchase-orders/${purchaseOrderId}/details`;

    const params = new URLSearchParams();

    if (options?.includeTimestamp) {
      params.append('t', Date.now().toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Genera URL para pagos
   */
  generatePaymentURL(
    paymentId: number,
    options?: {
      includeTimestamp?: boolean;
      includeVersion?: boolean;
      version?: string;
    }
  ): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    let url = `${baseUrl}/payments/${paymentId}/details`;

    const params = new URLSearchParams();

    if (options?.includeTimestamp) {
      params.append('t', Date.now().toString());
    }

    if (options?.includeVersion && options?.version) {
      params.append('v', options.version);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Genera URL para partes de entrada
   */
  generateEntryPartURL(
    entryPartId: number,
    options?: {
      includeTimestamp?: boolean;
      includeVersion?: boolean;
      version?: string;
    }
  ): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    let url = `${baseUrl}/entry-parts/${entryPartId}/details`;

    const params = new URLSearchParams();

    if (options?.includeTimestamp) {
      params.append('t', Date.now().toString());
    }

    if (options?.includeVersion && options?.version) {
      params.append('v', options.version);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Genera una URL para el frontend con datos estructurados
   */
  generateFrontendURL(data: QRData): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const path = this.getPathByType(data.type, data.id);

    const url = new URL(path, baseUrl);
    url.searchParams.set('t', data.timestamp.toString());
    url.searchParams.set('v', data.version);

    return url.toString();
  }

  /**
   * Genera datos estructurados para QR
   */
  generateQRData(type: QRData['type'], id: string): QRData {
    return {
      type,
      id,
      timestamp: Date.now(),
      version: '1.0',
    };
  }

  /**
   * Obtiene la ruta del frontend según el tipo
   */
  private getPathByType(type: QRData['type'], id: string): string {
    switch (type) {
      case 'requirement':
        return `/requirements/${id}/details`;
      case 'quotation':
        return `/quotations/${id}/details`;
      case 'payment':
        return `/payments/${id}/details`;
      default:
        throw new Error(`Tipo no soportado: ${type}`);
    }
  }

  /**
   * Genera QR para un documento específico
   */
  async generateDocumentQR(type: QRData['type'], id: string): Promise<string> {
    const data = this.generateQRData(type, id);
    const url = this.generateFrontendURL(data);
    return this.generateQRCode(url);
  }
}
