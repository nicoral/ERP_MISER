import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentInvoiceService } from '../services/paymentInvoice.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { CreatePaymentInvoiceDto } from '../dto/payment/create-payment-invoice.dto';
import { UpdatePaymentInvoiceDto } from '../dto/payment/create-payment-invoice.dto';
import { PaymentInvoice } from '../entities/PaymentInvoice.entity';

@Controller('payment-invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentInvoiceController {
  constructor(private readonly paymentInvoiceService: PaymentInvoiceService) {}

  @Post()
  @RequirePermissions('create_payment')
  @AuditDescription('Creación de factura de pago')
  @UseInterceptors(FileInterceptor('invoiceImage'))
  async createPaymentInvoice(
    @Body() createPaymentInvoiceDto: CreatePaymentInvoiceDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<PaymentInvoice> {
    return await this.paymentInvoiceService.createPaymentInvoice(
      createPaymentInvoiceDto,
      file
    );
  }

  @Get(':id')
  @RequirePermissions('view_payment')
  @AuditDescription('Consulta de factura de pago')
  async findPaymentInvoiceById(@Param('id') id: number): Promise<PaymentInvoice> {
    return await this.paymentInvoiceService.findPaymentInvoiceById(id);
  }

  @Get('payment-detail/:paymentDetailId')
  @RequirePermissions('view_payment')
  @AuditDescription('Consulta de facturas por PaymentDetail')
  async findInvoicesByPaymentDetail(
    @Param('paymentDetailId') paymentDetailId: number
  ): Promise<PaymentInvoice[]> {
    return await this.paymentInvoiceService.findInvoicesByPaymentDetail(paymentDetailId);
  }

  @Get('payment-detail/:paymentDetailId/statistics')
  @RequirePermissions('view_payment')
  @AuditDescription('Consulta de estadísticas de facturas')
  async getInvoicesStatistics(
    @Param('paymentDetailId') paymentDetailId: number
  ): Promise<{
    totalAmount: number;
    totalRetentionAmount: number;
    invoiceCount: number;
  }> {
    return await this.paymentInvoiceService.getInvoicesStatistics(paymentDetailId);
  }

  @Put(':id')
  @RequirePermissions('update_payment')
  @AuditDescription('Actualización de factura de pago')
  @UseInterceptors(FileInterceptor('invoiceImage'))
  async updatePaymentInvoice(
    @Param('id') id: number,
    @Body() updatePaymentInvoiceDto: UpdatePaymentInvoiceDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<PaymentInvoice> {
    return await this.paymentInvoiceService.updatePaymentInvoice(
      id,
      updatePaymentInvoiceDto,
      file
    );
  }

  @Delete(':id')
  @RequirePermissions('delete_payment')
  @AuditDescription('Eliminación de factura de pago')
  async deletePaymentInvoice(@Param('id') id: number): Promise<void> {
    return await this.paymentInvoiceService.deletePaymentInvoice(id);
  }
} 