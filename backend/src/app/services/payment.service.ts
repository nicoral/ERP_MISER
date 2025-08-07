import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentGroup, PaymentStatus } from '../entities/PaymentGroup.entity';
import {
  PaymentDetail,
  PaymentDetailStatus,
} from '../entities/PaymentDetail.entity';
import { CreatePaymentGroupDto } from '../dto/payment/create-payment-group.dto';
import { UpdatePaymentGroupDto } from '../dto/payment/update-payment-group.dto';
import { CreatePaymentDetailDto } from '../dto/payment/create-payment-detail.dto';
import { UpdatePaymentDetailReceiptDto } from '../dto/payment/create-payment-detail.dto';
import { UpdatePaymentDetailStatusDto } from '../dto/payment/create-payment-detail.dto';
import { StorageService } from './storage.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(PaymentGroup)
    private paymentGroupRepository: Repository<PaymentGroup>,
    @InjectRepository(PaymentDetail)
    private paymentDetailRepository: Repository<PaymentDetail>,
    private storageService: StorageService
  ) {}

  // ===== PAYMENT GROUP METHODS =====

  async createPaymentGroup(
    createPaymentGroupDto: CreatePaymentGroupDto
  ): Promise<PaymentGroup> {
    const { purchaseOrderId, ...paymentGroupData } = createPaymentGroupDto;

    // Verificar que no existe ya un PaymentGroup para esta cotización
    const existingPaymentGroup = await this.paymentGroupRepository.findOne({
      where: { purchaseOrder: { id: purchaseOrderId } },
    });

    if (existingPaymentGroup) {
      throw new BadRequestException(
        `Ya existe un grupo de pagos para la cotización ${purchaseOrderId}`
      );
    }
    // Crear el PaymentGroup
    const paymentGroup = this.paymentGroupRepository.create({
      code: paymentGroupData.code,
      totalAmount: paymentGroupData.totalAmount,
      purchaseOrder: { id: purchaseOrderId },
      pendingAmount: paymentGroupData.totalAmount, // Inicialmente todo está pendiente
    });

    return await this.paymentGroupRepository.save(paymentGroup);
  }

  async findAllPaymentGroups(
    page: number = 1,
    limit: number = 10,
    type: 'ARTICLE' | 'SERVICE' = 'ARTICLE',
    search?: string,
    filters?: {
      status?: string;
      hasReceiptNoInvoices?: boolean;
    }
  ) {
    const queryBuilder = this.paymentGroupRepository
      .createQueryBuilder('paymentGroup')
      .leftJoinAndSelect('paymentGroup.purchaseOrder', 'purchaseOrder')
      .leftJoinAndSelect('purchaseOrder.requirement', 'requirement')
      .leftJoinAndSelect('paymentGroup.paymentDetails', 'paymentDetails')
      .leftJoinAndSelect('paymentDetails.invoices', 'invoices')
      .where('requirement.type = :type', { type });

    if (search) {
      queryBuilder.andWhere('paymentGroup.code LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('paymentGroup.status = :status', {
        status: filters.status,
      });
    }

    // Filtro para PaymentGroups que tienen PaymentDetails con comprobante pero sin facturas
    if (filters?.hasReceiptNoInvoices) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM payment_detail pd WHERE pd.payment_group_id = paymentGroup.id AND pd."receiptImage" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM payment_invoice pi WHERE pi.payment_detail_id = pd.id))'
      );
    }

    const [data, total] = await queryBuilder
      .orderBy('paymentGroup.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPaymentGroupById(id: number): Promise<PaymentGroup> {
    const paymentGroup = await this.paymentGroupRepository.findOne({
      where: { id },
      relations: [
        'purchaseOrder',
        'purchaseOrder.supplier',
        'purchaseOrder.requirement',
        'paymentDetails',
        'paymentDetails.invoices',
        'paymentDetails.createdBy',
        'paymentDetails.approvedBy',
        'approvedBy',
      ],
    });

    if (!paymentGroup) {
      throw new NotFoundException(`Grupo de pagos con ID ${id} no encontrado`);
    }

    return paymentGroup;
  }

  async updatePaymentGroup(
    id: number,
    updatePaymentGroupDto: UpdatePaymentGroupDto
  ): Promise<PaymentGroup> {
    const paymentGroup = await this.findPaymentGroupById(id);

    // Actualizar el PaymentGroup
    Object.assign(paymentGroup, updatePaymentGroupDto);

    // Si se actualiza el monto pagado, recalcular el pendiente
    if (updatePaymentGroupDto.paidAmount !== undefined) {
      paymentGroup.pendingAmount =
        paymentGroup.totalAmount - paymentGroup.paidAmount;

      // Actualizar el estado según el progreso
      if (paymentGroup.paidAmount >= paymentGroup.totalAmount) {
        paymentGroup.status = PaymentStatus.COMPLETED;
      } else if (paymentGroup.paidAmount > 0) {
        paymentGroup.status = PaymentStatus.PARTIAL;
      }
    }

    return await this.paymentGroupRepository.save(paymentGroup);
  }

  // ===== PAYMENT DETAIL METHODS =====

  async createPaymentDetail(
    createPaymentDetailDto: CreatePaymentDetailDto,
    userId: number
  ): Promise<PaymentDetail> {
    const { paymentGroupId, ...paymentDetailData } = createPaymentDetailDto;

    // Verificar que el PaymentGroup existe y no esté cancelado
    const paymentGroup = await this.paymentGroupRepository.findOne({
      where: { id: paymentGroupId },
    });

    if (!paymentGroup) {
      throw new NotFoundException(
        `Grupo de pagos con ID ${paymentGroupId} no encontrado`
      );
    }

    if (paymentGroup.status === PaymentStatus.CANCELLED) {
      throw new BadRequestException(
        'No se pueden agregar pagos a un grupo de pagos cancelado'
      );
    }

    // Crear el PaymentDetail
    const paymentDetail = this.paymentDetailRepository.create({
      ...paymentDetailData,
      paymentGroup,
      createdBy: { id: userId },
    });

    const savedPaymentDetail =
      await this.paymentDetailRepository.save(paymentDetail);

    // Actualizar el PaymentGroup
    await this.updatePaymentGroupAmounts(paymentGroup.id);

    return savedPaymentDetail;
  }

  async updatePaymentDetailReceipt(
    id: number,
    updateReceiptDto: UpdatePaymentDetailReceiptDto,
    receiptImage?: Express.Multer.File,
    retentionDocument?: Express.Multer.File
  ): Promise<PaymentDetail> {
    const paymentDetail = await this.paymentDetailRepository.findOne({
      where: { id },
      relations: ['paymentGroup', 'createdBy', 'approvedBy'],
    });

    if (!paymentDetail) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    // Subir imagen del comprobante si se proporciona
    if (receiptImage) {
      const fileName = `${id}-${Date.now()}.${receiptImage.originalname.split('.').pop()}`;
      const path = `payments/receipts/${fileName}`;
      const uploadResult = await this.storageService.uploadFile(
        path,
        receiptImage.buffer,
        receiptImage.mimetype
      );
      updateReceiptDto.receiptImage = uploadResult.url;
    }

    // Subir documento de retención si se proporciona
    if (retentionDocument) {
      const fileName = `${id}-${Date.now()}.${retentionDocument.originalname.split('.').pop()}`;
      const path = `payments/retention-documents/${fileName}`;
      const uploadResult = await this.storageService.uploadFile(
        path,
        retentionDocument.buffer,
        retentionDocument.mimetype
      );
      updateReceiptDto.retentionDocument = uploadResult.url;
    }

    // Actualizar el PaymentDetail
    Object.assign(paymentDetail, updateReceiptDto);
    const updatedPaymentDetail =
      await this.paymentDetailRepository.save(paymentDetail);

    // Actualizar los montos del PaymentGroup
    await this.updatePaymentGroupAmounts(paymentDetail.paymentGroup.id);

    return updatedPaymentDetail;
  }

  async updatePaymentDetailStatus(
    id: number,
    updatePaymentDetailStatusDto: UpdatePaymentDetailStatusDto,
    userId: number
  ): Promise<PaymentDetail> {
    const paymentDetail = await this.paymentDetailRepository.findOne({
      where: { id },
      relations: ['paymentGroup'],
    });

    if (!paymentDetail) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    // Actualizar el pago
    Object.assign(paymentDetail, {
      ...updatePaymentDetailStatusDto,
      approvedBy: { id: userId },
    });

    const savedPaymentDetail =
      await this.paymentDetailRepository.save(paymentDetail);

    // Si se aprueba el pago, actualizar el PaymentGroup
    if (updatePaymentDetailStatusDto.status === PaymentDetailStatus.APPROVED) {
      await this.updatePaymentGroupAmounts(paymentDetail.paymentGroup.id);
    }

    return savedPaymentDetail;
  }

  async findPaymentDetailById(id: number): Promise<PaymentDetail> {
    const paymentDetail = await this.paymentDetailRepository.findOne({
      where: { id },
      relations: [
        'paymentGroup',
        'paymentGroup.purchaseOrder',
        'invoices',
        'createdBy',
        'approvedBy',
      ],
    });

    if (!paymentDetail) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return paymentDetail;
  }

  async cancelPaymentGroup(id: number): Promise<PaymentGroup> {
    const paymentGroup = await this.paymentGroupRepository.findOne({
      where: { id },
      relations: ['paymentDetails', 'paymentDetails.invoices'],
    });

    if (!paymentGroup) {
      throw new NotFoundException(`Grupo de pagos con ID ${id} no encontrado`);
    }

    // Verificar que no haya ningún PaymentDetail con comprobante o facturas
    const hasPaymentsWithReceipts = paymentGroup.paymentDetails.some(
      detail => detail.receiptImage || (detail.invoices && detail.invoices.length > 0)
    );

    if (hasPaymentsWithReceipts) {
      throw new BadRequestException(
        'No se puede cancelar un grupo de pagos que ya tiene pagos con comprobantes o facturas registradas'
      );
    }

    // Verificar que el grupo esté en estado PENDING
    if (paymentGroup.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Solo se pueden cancelar grupos de pagos en estado pendiente');
    }

    // Actualizar el estado a CANCELLED
    paymentGroup.status = PaymentStatus.CANCELLED;

    return await this.paymentGroupRepository.save(paymentGroup);
  }

  // ===== PRIVATE METHODS =====

  private async updatePaymentGroupAmounts(
    paymentGroupId: number
  ): Promise<void> {
    const paymentGroup = await this.paymentGroupRepository.findOne({
      where: { id: paymentGroupId },
      relations: ['paymentDetails'],
    });

    if (!paymentGroup) return;

    // Calcular el monto total pagado
    const paidAmount = paymentGroup.paymentDetails.reduce(
      (sum, payment) => sum + +payment.amount,
      0
    );

    // Actualizar el PaymentGroup
    paymentGroup.paidAmount = paidAmount;
    paymentGroup.pendingAmount = paymentGroup.totalAmount - paidAmount;

    // Actualizar el estado
    if (paidAmount >= paymentGroup.totalAmount) {
      paymentGroup.status = PaymentStatus.COMPLETED;
    } else if (paidAmount > 0) {
      paymentGroup.status = PaymentStatus.PARTIAL;
    }

    await this.paymentGroupRepository.save(paymentGroup);
  }

  async getPaymentStatistics(type: 'ARTICLE' | 'SERVICE'): Promise<{
    PENDING: number;
    APPROVED: number;
    PARTIAL: number;
    CANCELLED: number;
    WITH_RECEIPT_NO_INVOICES: number; // Nueva estadística
  }> {
    const [pending, approved, partial, cancelled, withReceiptNoInvoices] = await Promise.all([
      this.paymentGroupRepository.count({
        where: {
          status: PaymentStatus.PENDING,
          purchaseOrder: {
            requirement: { type },
          },
        },
      }),
      this.paymentGroupRepository.count({
        where: {
          status: PaymentStatus.COMPLETED,
          purchaseOrder: {
            requirement: { type },
          },
        },
      }),
      this.paymentGroupRepository.count({
        where: {
          status: PaymentStatus.PARTIAL,
          purchaseOrder: {
            requirement: { type },
          },
        },
      }),
      this.paymentGroupRepository.count({
        where: {
          status: PaymentStatus.CANCELLED,
          purchaseOrder: {
            requirement: { type },
          },
        },
      }),
      // Nueva consulta: PaymentDetails con comprobante pero sin facturas
      this.paymentDetailRepository
        .createQueryBuilder('paymentDetail')
        .leftJoin('paymentDetail.paymentGroup', 'paymentGroup')
        .leftJoin('paymentGroup.purchaseOrder', 'purchaseOrder')
        .leftJoin('purchaseOrder.requirement', 'requirement')
        .leftJoin('paymentDetail.invoices', 'invoices')
        .where('requirement.type = :type', { type })
        .andWhere('paymentDetail.receiptImage IS NOT NULL')
        .andWhere('invoices.id IS NULL')
        .getCount(),
    ]);

    return {
      PENDING: pending,
      APPROVED: approved,
      PARTIAL: partial,
      CANCELLED: cancelled,
      WITH_RECEIPT_NO_INVOICES: withReceiptNoInvoices,
    };
  }
}

