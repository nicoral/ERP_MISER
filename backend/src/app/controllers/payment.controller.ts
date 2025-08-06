import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { CreatePaymentGroupDto } from '../dto/payment/create-payment-group.dto';
import { UpdatePaymentGroupDto } from '../dto/payment/update-payment-group.dto';
import { CreatePaymentDetailDto } from '../dto/payment/create-payment-detail.dto';
import { UpdatePaymentDetailReceiptDto } from '../dto/payment/create-payment-detail.dto';
import { UpdatePaymentDetailInvoiceDto } from '../dto/payment/create-payment-detail.dto';
import { UpdatePaymentDetailStatusDto } from '../dto/payment/create-payment-detail.dto';
import { PaymentGroup } from '../entities/PaymentGroup.entity';
import { PaymentDetail } from '../entities/PaymentDetail.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ===== PAYMENT GROUP ENDPOINTS =====

  @Post('groups')
  @RequirePermissions('create_payment')
  @AuditDescription('Creación de grupo de pagos')
  async createPaymentGroup(
    @Body() createPaymentGroupDto: CreatePaymentGroupDto
  ): Promise<PaymentGroup> {
    return await this.paymentService.createPaymentGroup(createPaymentGroupDto);
  }

  @Get('groups')
  @RequirePermissions('view_payments')
  @AuditDescription('Consulta de grupos de pagos')
  async findAllPaymentGroups(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type?: 'ARTICLE' | 'SERVICE',
    @Query('search') search?: string
  ) {
    return await this.paymentService.findAllPaymentGroups(
      page,
      limit,
      type,
      search
    );
  }

  @Get('groups/statistics')
  @RequirePermissions('view_payments')
  @AuditDescription('Estadísticas de grupos de pagos')
  async getPaymentStatistics(
    @Query('type') type: 'ARTICLE' | 'SERVICE'
  ): Promise<{
    PENDING: number;
    APPROVED: number;
    PARTIAL: number;
    CANCELLED: number;
  }> {
    return await this.paymentService.getPaymentStatistics(type);
  }

  @Get('groups/:id')
  @RequirePermissions('view_payments')
  @AuditDescription('Consulta de grupo de pagos')
  async findPaymentGroupById(@Param('id') id: number): Promise<PaymentGroup> {
    return await this.paymentService.findPaymentGroupById(id);
  }

  @Put('groups/:id')
  @RequirePermissions('update_payment')
  @AuditDescription('Actualización de grupo de pagos')
  async updatePaymentGroup(
    @Param('id') id: number,
    @Body() updatePaymentGroupDto: UpdatePaymentGroupDto
  ): Promise<PaymentGroup> {
    return await this.paymentService.updatePaymentGroup(
      id,
      updatePaymentGroupDto
    );
  }

  // ===== PAYMENT DETAIL ENDPOINTS =====

  @Post('details')
  @RequirePermissions('create_payment')
  @AuditDescription('Creación de pago individual')
  async createPaymentDetail(
    @Body() createPaymentDetailDto: CreatePaymentDetailDto,
    @Request() req: { user: { id: number } }
  ): Promise<PaymentDetail> {
    return await this.paymentService.createPaymentDetail(
      createPaymentDetailDto,
      req.user.id
    );
  }

  @Put('details/:id/receipt')
  @RequirePermissions('update_payment')
  @AuditDescription('Actualización de comprobante de pago')
  @UseInterceptors(FileInterceptor('receiptImage'))
  async updatePaymentDetailReceipt(
    @Param('id') id: number,
    @Body() updatePaymentDetailReceiptDto: UpdatePaymentDetailReceiptDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<PaymentDetail> {
    return await this.paymentService.updatePaymentDetailReceipt(
      id,
      updatePaymentDetailReceiptDto,
      file
    );
  }

  @Put('details/:id/invoice')
  @RequirePermissions('update_payment')
  @AuditDescription('Actualización de factura de pago')
  @UseInterceptors(FileInterceptor('invoiceImage'))
  async updatePaymentDetailInvoice(
    @Param('id') id: number,
    @Body() updatePaymentDetailInvoiceDto: UpdatePaymentDetailInvoiceDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<PaymentDetail> {
    return await this.paymentService.updatePaymentDetailInvoice(
      id,
      updatePaymentDetailInvoiceDto,
      file
    );
  }

  @Put('details/:id/status')
  @RequirePermissions('approve_payment')
  @AuditDescription('Aprobación/rechazo de pago')
  async updatePaymentDetailStatus(
    @Param('id') id: number,
    @Body() updatePaymentDetailStatusDto: UpdatePaymentDetailStatusDto,
    @Request() req: { user: { id: number } }
  ): Promise<PaymentDetail> {
    return await this.paymentService.updatePaymentDetailStatus(
      id,
      updatePaymentDetailStatusDto,
      req.user.id
    );
  }

  @Get('details/:id')
  @RequirePermissions('view_payments')
  @AuditDescription('Consulta de pago individual')
  async findPaymentDetailById(@Param('id') id: number): Promise<PaymentDetail> {
    return await this.paymentService.findPaymentDetailById(id);
  }
}
