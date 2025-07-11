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
import { UpdatePaymentDetailInvoiceDto } from '../dto/payment/create-payment-detail.dto';
import { UpdatePaymentDetailStatusDto } from '../dto/payment/create-payment-detail.dto';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(PaymentGroup)
    private paymentGroupRepository: Repository<PaymentGroup>,
    @InjectRepository(PaymentDetail)
    private paymentDetailRepository: Repository<PaymentDetail>,
    private cloudinaryService: CloudinaryService
  ) {}

  // ===== PAYMENT GROUP METHODS =====

  async createPaymentGroup(
    createPaymentGroupDto: CreatePaymentGroupDto,
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
    search?: string
  ) {
    const queryBuilder = this.paymentGroupRepository
      .createQueryBuilder('paymentGroup')
      .leftJoinAndSelect('paymentGroup.purchaseOrder', 'purchaseOrder')
      .leftJoinAndSelect('paymentGroup.paymentDetails', 'paymentDetails')
      .orderBy('paymentGroup.createdAt', 'DESC');

    if (search) {
      queryBuilder.where(
        'paymentGroup.code ILIKE :search OR purchaseOrder.code ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
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
        'approvedBy',
        'paymentDetails',
        'paymentDetails.createdBy',
        'paymentDetails.approvedBy',
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

    // Verificar que el PaymentGroup existe
    const paymentGroup = await this.paymentGroupRepository.findOne({
      where: { id: paymentGroupId },
    });

    if (!paymentGroup) {
      throw new NotFoundException(
        `Grupo de pagos con ID ${paymentGroupId} no encontrado`
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
    updatePaymentDetailReceiptDto: UpdatePaymentDetailReceiptDto,
    file?: Express.Multer.File
  ): Promise<PaymentDetail> {
    const paymentDetail = await this.paymentDetailRepository.findOne({
      where: { id },
      relations: ['paymentGroup'],
    });

    if (!paymentDetail) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    // Si se sube una imagen, guardarla en Cloudinary
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(
        file,
        'payments/receipts',
        false
      );
      updatePaymentDetailReceiptDto.receiptImage = uploadResult.secure_url;
    }

    // Actualizar el pago
    Object.assign(paymentDetail, updatePaymentDetailReceiptDto);

    return await this.paymentDetailRepository.save(paymentDetail);
  }

  async updatePaymentDetailInvoice(
    id: number,
    updatePaymentDetailInvoiceDto: UpdatePaymentDetailInvoiceDto,
    file?: Express.Multer.File
  ): Promise<PaymentDetail> {
    const paymentDetail = await this.paymentDetailRepository.findOne({
      where: { id },
      relations: ['paymentGroup'],
    });

    if (!paymentDetail) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    // Si se sube una imagen, guardarla en Cloudinary
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(
        file,
        'payments/invoices',
        false
      );
      updatePaymentDetailInvoiceDto.invoiceImage = uploadResult.secure_url;
    }

    // Actualizar el pago
    Object.assign(paymentDetail, updatePaymentDetailInvoiceDto);

    return await this.paymentDetailRepository.save(paymentDetail);
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
        'createdBy',
        'approvedBy',
      ],
    });

    if (!paymentDetail) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return paymentDetail;
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
    const paidAmount = paymentGroup.paymentDetails
      .reduce((sum, payment) => sum + (+payment.amount), 0);

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

  async getPaymentStatistics(): Promise<{
    PENDING: number;
    APPROVED: number;
    PARTIAL: number;
    CANCELLED: number;
  }
  > {
    const paymentGroups = await this.paymentGroupRepository.find();
    return {
      PENDING: paymentGroups.filter(group => group.status === PaymentStatus.PENDING).length,
      APPROVED: paymentGroups.filter(group => group.status === PaymentStatus.COMPLETED).length,
      PARTIAL: paymentGroups.filter(group => group.status === PaymentStatus.PARTIAL).length,
      CANCELLED: paymentGroups.filter(group => group.status === PaymentStatus.CANCELLED).length,
    };
  }
}
