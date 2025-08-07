import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentInvoice } from '../entities/PaymentInvoice.entity';
import { PaymentDetail } from '../entities/PaymentDetail.entity';
import { CreatePaymentInvoiceDto } from '../dto/payment/create-payment-invoice.dto';
import { UpdatePaymentInvoiceDto } from '../dto/payment/create-payment-invoice.dto';
import { StorageService } from './storage.service';

@Injectable()
export class PaymentInvoiceService {
  constructor(
    @InjectRepository(PaymentInvoice)
    private paymentInvoiceRepository: Repository<PaymentInvoice>,
    @InjectRepository(PaymentDetail)
    private paymentDetailRepository: Repository<PaymentDetail>,
    private storageService: StorageService
  ) {}

  async createPaymentInvoice(
    createPaymentInvoiceDto: CreatePaymentInvoiceDto,
    file?: Express.Multer.File
  ): Promise<PaymentInvoice> {
    const { paymentDetailId, ...invoiceData } = createPaymentInvoiceDto;

    // Verificar que el PaymentDetail existe
    const paymentDetail = await this.paymentDetailRepository.findOne({
      where: { id: paymentDetailId },
    });

    if (!paymentDetail) {
      throw new NotFoundException(
        `PaymentDetail con ID ${paymentDetailId} no encontrado`
      );
    }

    // Si se sube una imagen, guardarla en Cloudinary
    if (file) {
      const fileName = `${paymentDetailId}-${Date.now()}.${file.originalname
        .split('.')
        .pop()}`;
      const path = `payments/invoices/${fileName}`;
      const uploadResult = await this.storageService.uploadFile(
        path,
        file.buffer,
        file.mimetype
      );
      invoiceData.invoiceImage = uploadResult.url;
    }

    // Crear la factura
    const paymentInvoice = this.paymentInvoiceRepository.create({
      ...invoiceData,
      paymentDetail: { id: paymentDetailId },
    });

    return await this.paymentInvoiceRepository.save(paymentInvoice);
  }

  async updatePaymentInvoice(
    id: number,
    updatePaymentInvoiceDto: UpdatePaymentInvoiceDto,
    file?: Express.Multer.File
  ): Promise<PaymentInvoice> {
    const paymentInvoice = await this.paymentInvoiceRepository.findOne({
      where: { id },
    });

    if (!paymentInvoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    // Si se sube una imagen, guardarla en Cloudinary
    if (file) {
      if (paymentInvoice.invoiceImage) {
        await this.storageService.removeFileByUrl(paymentInvoice.invoiceImage);
      }
      const fileName = `${id}-${Date.now()}.${file.originalname.split('.').pop()}`;
      const path = `payments/invoices/${fileName}`;
      const uploadResult = await this.storageService.uploadFile(
        path,
        file.buffer,
        file.mimetype
      );
      updatePaymentInvoiceDto.invoiceImage = uploadResult.url;
    }

    // Actualizar la factura
    Object.assign(paymentInvoice, updatePaymentInvoiceDto);

    return await this.paymentInvoiceRepository.save(paymentInvoice);
  }

  async findPaymentInvoiceById(id: number): Promise<PaymentInvoice> {
    const paymentInvoice = await this.paymentInvoiceRepository.findOne({
      where: { id },
      relations: ['paymentDetail'],
    });

    if (!paymentInvoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    return paymentInvoice;
  }

  async findInvoicesByPaymentDetail(paymentDetailId: number): Promise<PaymentInvoice[]> {
    return await this.paymentInvoiceRepository.find({
      where: { paymentDetail: { id: paymentDetailId } },
      order: { createdAt: 'ASC' },
    });
  }

  async deletePaymentInvoice(id: number): Promise<void> {
    const paymentInvoice = await this.findPaymentInvoiceById(id);

    // Eliminar imagen de Cloudinary si existe
    if (paymentInvoice.invoiceImage) {
      await this.storageService.removeFileByUrl(paymentInvoice.invoiceImage);
    }

    await this.paymentInvoiceRepository.remove(paymentInvoice);
  }

  async getInvoicesStatistics(paymentDetailId: number): Promise<{
    totalAmount: number;
    totalRetentionAmount: number;
    invoiceCount: number;
  }> {
    const invoices = await this.findInvoicesByPaymentDetail(paymentDetailId);

    const totalAmount = invoices.reduce((sum, invoice) => sum + +invoice.amount, 0);
    const totalRetentionAmount = invoices.reduce(
      (sum, invoice) => sum + +invoice.retentionAmount, 0
    );
    const invoiceCount = invoices.length;

    return {
      totalAmount,
      totalRetentionAmount,
      invoiceCount,
    };
  }
} 