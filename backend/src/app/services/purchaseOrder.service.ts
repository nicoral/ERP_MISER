import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
} from '../entities/PurchaseOrder.entity';
import { QuotationRequest } from '../entities/QuotationRequest.entity';
import { PaymentGroup } from '../entities/PaymentGroup.entity';
import { QRService } from './qr.service';
import { CreatePurchaseOrderDto } from '../dto/purchaseOrder/create-purchase-order.dto';
import { UpdatePurchaseOrderPaymentDto } from '../dto/purchaseOrder/update-purchase-order-payment.dto';

import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { numberToSpanishWordsCurrency } from '../utils/utils';
import { EntryPartService } from './entryPart.service';
import { EntryPartStatus, InspectionStatus } from '../common/enum';
import { StorageService } from './storage.service';
import { UpdatePurchaseOrderDto } from '../dto/purchaseOrder/update-purchase-order.dto';
import { formatNumber } from '../utils/transformer';
import { EmployeeService } from './employee.service';
import { RoleService } from './role.service';
import { GeneralSettingsService } from './generalSettings.service';
import { DocumentApprovalConfigurationService } from './documentApprovalConfiguration.service';
import {
  validateSignatureEligibility,
  canUserSignWithConfiguration,
  processSignatureWithConfiguration,
} from '../utils/approvalFlow.utils';
import { DocumentApprovalConfiguration } from '../entities/DocumentApprovalConfiguration.entity';
import { Requirement } from '../entities/Requirement.entity';

@Injectable()
export class PurchaseOrderService {
  private readonly logger = new Logger(PurchaseOrderService.name);

  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(QuotationRequest)
    private readonly quotationRequestRepository: Repository<QuotationRequest>,
    @InjectRepository(PaymentGroup)
    private readonly paymentGroupRepository: Repository<PaymentGroup>,
    @InjectRepository(Requirement)
    private readonly requirementRepository: Repository<Requirement>,
    private readonly qrService: QRService,
    private readonly entryPartService: EntryPartService,
    private readonly storageService: StorageService,
    private readonly employeeService: EmployeeService,
    private readonly roleService: RoleService,
    private readonly generalSettingsService: GeneralSettingsService,
    private readonly documentApprovalConfigurationService: DocumentApprovalConfigurationService
  ) {}

  // ========================================
  // PUBLIC ENDPOINTS
  // ========================================

  /**
   * 1. Obtener PurchaseOrder por quotation
   */
  async findByQuotation(
    quotationRequestId: number,
    supplierId?: number
  ): Promise<PurchaseOrder | PurchaseOrder[]> {
    const purchaseOrders = await this.purchaseOrderRepository.find({
      where: {
        quotationRequest: { id: quotationRequestId },
        ...(supplierId && { supplier: { id: supplierId } }),
      },
      relations: [
        'quotationRequest',
        'supplier',
        'createdBy',
        'requirement',
        'requirement.employee',
        'requirement.costCenter',
        'costCenterEntity',
      ],
      order: { createdAt: 'DESC' },
    });

    if (!purchaseOrders) {
      throw new NotFoundException(
        'No se encontraron órdenes de compra para esta cotización'
      );
    }

    if (supplierId) {
      return purchaseOrders[0];
    }

    return purchaseOrders;
  }

  /**
   * 2. Obtener PurchaseOrder por requirement
   */
  async findByRequirement(
    requirementId: number,
    supplierId: number
  ): Promise<PurchaseOrder> {
    const purchaseOrders = await this.purchaseOrderRepository.findOne({
      where: {
        requirement: { id: requirementId },
        supplier: { id: supplierId },
      },
      relations: [
        'quotationRequest',
        'supplier',
        'createdBy',
        'requirement',
        'requirement.employee',
        'requirement.costCenter',
        'costCenterEntity',
      ],
    });

    if (!purchaseOrders) {
      throw new NotFoundException(
        'No se encontró la orden de compra para este requerimiento y proveedor'
      );
    }

    return purchaseOrders;
  }

  /**
   * 3. Obtener resumen de órdenes de compra por cotización
   */
  async getQuotationSummary(quotationRequestId: number): Promise<{
    totalPurchaseOrders: number;
    totalSuppliersWithFinalSelection: number;
    canSignFirstSignature: boolean;
  }> {
    // Obtener la cotización con la selección final
    const quotationRequest = await this.quotationRequestRepository.findOne({
      where: { id: quotationRequestId },
      relations: [
        'finalSelection',
        'finalSelection.finalSelectionItems',
        'finalSelection.finalSelectionItems.supplier',
        'finalSelection.finalSelectionServiceItems',
        'finalSelection.finalSelectionServiceItems.supplier',
      ],
    });

    if (!quotationRequest) {
      throw new NotFoundException('Cotización no encontrada');
    }

    if (!quotationRequest.finalSelection) {
      return {
        totalPurchaseOrders: 0,
        totalSuppliersWithFinalSelection: 0,
        canSignFirstSignature: false,
      };
    }

    // Contar proveedores únicos en la selección final (artículos + servicios)
    const allSuppliers = [
      ...quotationRequest.finalSelection.finalSelectionItems.map(
        item => item.supplier.id
      ),
      ...quotationRequest.finalSelection.finalSelectionServiceItems.map(
        item => item.supplier.id
      ),
    ];
    const suppliersWithFinalSelection = new Set(allSuppliers);
    const totalSuppliersWithFinalSelection = suppliersWithFinalSelection.size;

    // Contar órdenes de compra generadas para esta cotización
    const purchaseOrders = await this.purchaseOrderRepository.find({
      where: { quotationRequest: { id: quotationRequestId } },
      relations: ['supplier'],
    });

    const totalPurchaseOrders = purchaseOrders.length;

    // Verificar si se puede firmar la primera firma
    // Se puede firmar si todas las órdenes de compra han sido generadas
    const canSignFirstSignature =
      totalPurchaseOrders === totalSuppliersWithFinalSelection;

    return {
      totalPurchaseOrders,
      totalSuppliersWithFinalSelection,
      canSignFirstSignature,
    };
  }

  /**
   * 4. Actualizar datos únicos de IGV y paymentMethod
   */
  async updatePurchaseOrderPayment(
    id: number,
    updatePurchaseOrderDto: UpdatePurchaseOrderPaymentDto
  ): Promise<PurchaseOrder> {
    await this.findOne(id);

    // Validar que solo se actualicen los campos permitidos
    const { igv, paymentMethod, observation } = updatePurchaseOrderDto;

    if (igv !== undefined) {
      if (igv < 0 || igv > 100) {
        throw new BadRequestException('El IGV debe estar entre 0 y 100');
      }
    }

    // Actualizar campos
    await this.purchaseOrderRepository.update(id, {
      ...(igv !== undefined && { igv }),
      ...(paymentMethod !== undefined && { paymentMethod }),
      ...(observation !== undefined && { observation }),
    });

    return this.findOne(id);
  }

  async updatePurchaseOrder(
    id: number,
    updatePurchaseOrderDto: UpdatePurchaseOrderDto
  ): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);
    if (!purchaseOrder) {
      throw new BadRequestException(
        'No se puede actualizar una orden de compra que no existe'
      );
    }
    await this.purchaseOrderRepository.update(id, updatePurchaseOrderDto);
    return this.findOne(id);
  }

  /**
   * 6. Generador de PDF
   */
  async generatePurchaseOrderPdf(id: number): Promise<Buffer> {
    const purchaseOrder = await this.findOne(id);

    // Generar QR para la orden de compra
    const qrUrl = this.qrService.generatePurchaseOrderURL(purchaseOrder.id, {
      includeTimestamp: true,
      includeVersion: true,
      version: '1.0',
    });
    const qrDataUrl = await this.qrService.generateQRCode(qrUrl);

    // Obtener configuración de firmas para determinar cuáles mostrar
    const configurations =
      await this.documentApprovalConfigurationService.getConfigurationForDocument(
        'purchase_order',
        purchaseOrder.id
      );

    // Generar firmas dinámicas basadas en la configuración
    const dynamicSignatures = await this.generateDynamicSignatures(
      purchaseOrder,
      configurations
    );

    const data = {
      // Información básica
      type:
        purchaseOrder.requirement?.type === 'ARTICLE' ? 'COMPRA' : 'SERVICIO',
      code: purchaseOrder.code,
      requirementNumber: purchaseOrder.requirement?.code || '-',
      quotationNumber: purchaseOrder.quotationRequest?.code || '-',
      orderNumber: purchaseOrder.orderNumber,
      date: new Date(purchaseOrder.issueDate).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),

      // Información del comprador
      buyerName: purchaseOrder.buyerName,
      buyerRUC: purchaseOrder.buyerRUC,
      buyerAddress: purchaseOrder.buyerAddress,
      buyerLocation: purchaseOrder.buyerLocation,
      buyerPhone: purchaseOrder.buyerPhone,

      // Información del proveedor
      supplierName: purchaseOrder.supplierName,
      supplierRUC: purchaseOrder.supplierRUC,
      supplierAddress: purchaseOrder.supplierAddress,
      supplierLocation: purchaseOrder.supplierLocation,
      supplierPhone: purchaseOrder.supplierPhone,

      // Información del solicitante
      requestedBy: purchaseOrder.requirement?.employee
        ? `${purchaseOrder.requirement.employee.firstName} ${purchaseOrder.requirement.employee.lastName}`
        : '-',
      preparedBy: purchaseOrder.createdBy
        ? `${purchaseOrder.createdBy.firstName} ${purchaseOrder.createdBy.lastName}`
        : '-',
      costCenter: purchaseOrder.requirement?.costCenter?.description || '-',

      // Artículos
      items: purchaseOrder.items,

      // Condiciones de pago y entrega
      paymentMethod: purchaseOrder.paymentMethod || '-',
      deliveryDate: purchaseOrder.deliveryDate,

      // Totales
      subtotal: `S/. ${(+purchaseOrder.subtotal).toFixed(2)}`,
      igv: `S/. ${(+purchaseOrder.igv).toFixed(2)}`,
      total: `S/. ${(+purchaseOrder.total).toFixed(2)}`,
      currency: purchaseOrder.currency,
      totalInWords: numberToSpanishWordsCurrency(
        +purchaseOrder.total,
        purchaseOrder.currency as 'USD' | 'PEN'
      ),

      // Observaciones
      observationsLine2: purchaseOrder.observation || '-',

      // Firmas dinámicas
      signatures: dynamicSignatures,

      // QR Code
      qrCode: qrDataUrl,
    };

    // Leer y compilar el template
    const templateHtml = fs.readFileSync(
      path.join(__dirname, '../../templates/purchase-order.template.html'),
      'utf8'
    );

    // Registrar helpers de Handlebars
    Handlebars.registerHelper('divide', function (a, b) {
      return Math.round(a / b);
    });

    const template = Handlebars.compile(templateHtml);
    const html = template(data);

    // Generar el PDF con puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10px', bottom: '10px', left: '5px', right: '5px' },
    });
    await browser.close();

    return Buffer.from(pdfBuffer);
  }

  /**
   * Genera las firmas dinámicas basadas en la configuración
   */
  private async generateDynamicSignatures(
    purchaseOrder: PurchaseOrder,
    configurations: DocumentApprovalConfiguration[]
  ): Promise<
    Array<{
      level: number;
      role: string;
      roleName: string;
      signature: string | null;
      signedAt: string;
      hasSignature: boolean;
    }>
  > {
    const signatures: Array<{
      level: number;
      role: string;
      roleName: string;
      signature: string | null;
      signedAt: string;
      hasSignature: boolean;
    }> = [];

    const signatureLevels = ['first', 'second', 'third', 'fourth'];
    const roleNames: Record<string, string> = {
      SOLICITANTE: 'SOLICITANTE',
      OFICINA_TECNICA: 'OFICINA TÉCNICA',
      ADMINISTRACION: 'ADMINISTRACIÓN',
      GERENCIA: 'GERENCIA',
    };

    // Obtener los niveles configurados ordenados
    const configuredLevels = configurations
      .sort((a, b) => a.signatureLevel - b.signatureLevel)
      .map(config => ({
        level: config.signatureLevel,
        role: config.roleName,
        roleName: roleNames[config.roleName] || config.roleName,
      }));

    // Generar firmas solo para los niveles configurados
    for (const config of configuredLevels) {
      const signatureKey = `${signatureLevels[config.level - 1]}Signature`;
      const signedAtKey = `${signatureLevels[config.level - 1]}SignedAt`;

      const signature = purchaseOrder[signatureKey];
      const signedAt = purchaseOrder[signedAtKey];

      signatures.push({
        level: config.level,
        role: config.role,
        roleName: config.roleName,
        signature: signature
          ? (await this.storageService.getPrivateFileUrl(signature)).url
          : null,
        signedAt: signedAt
          ? signedAt.toLocaleDateString('es-PE', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
          : '',
        hasSignature: !!signature,
      });
    }

    return signatures;
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  /**
   * 4. Creación de PurchaseOrder (método privado)
   */
  async createPurchaseOrder(
    createPurchaseOrderDto: CreatePurchaseOrderDto
  ): Promise<PurchaseOrder> {
    const {
      quotationRequestId,
      supplierId,
      createdById,
      requirementId,
      ...purchaseOrderDto
    } = createPurchaseOrderDto;

    if (!requirementId) {
      throw new BadRequestException('Requirement ID is required');
    }

    const requirement = await this.getRequirement(requirementId);

    // Crear la orden de compra con datos quemados del comprador
    const purchaseOrderData = {
      ...purchaseOrderDto,
      // Datos quemados del comprador (MYSER)
      buyerName: 'MAQUINARIA Y SERVICIOS ALTO HUARCA S.A',
      buyerRUC: '20490597795',
      buyerAddress: 'AV. LA MARINA - ZONA NORTE G1',
      buyerLocation: '',
      buyerPhone: '',
      // Campos nulos al inicio
      quotationRequest: quotationRequestId ? { id: quotationRequestId } : null,
      supplier: { id: supplierId },
      createdBy: { id: createdById },
      requirement: { id: requirementId },
      costCenterEntity: { id: requirement.costCenter.id },
      observation: requirement.observation || null,
      code: new Date().getTime().toString(),
    };

    // Crear la entidad directamente
    const purchaseOrder = new PurchaseOrder();
    Object.assign(purchaseOrder, purchaseOrderData);

    // Guardamos para obtener el ID
    const savedPurchaseOrder =
      await this.purchaseOrderRepository.save(purchaseOrder);

    // Generamos el código con el formato: {warehouse_id}-{purchase_order_id}
    const code = `${formatNumber(
      requirement.warehouse?.id,
      4
    )}-${formatNumber(savedPurchaseOrder.id, 10)}`;

    // Actualizamos el código
    await this.purchaseOrderRepository.update(savedPurchaseOrder.id, { code });

    return this.findOne(savedPurchaseOrder.id);
  }

  /**
   * Método auxiliar para encontrar una orden de compra
   */
  async findOne(id: number): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: [
        'quotationRequest',
        'supplier',
        'createdBy',
        'requirement',
        'requirement.employee',
        'requirement.costCenter',
        'costCenterEntity',
      ],
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Orden de compra no encontrada');
    }

    return purchaseOrder;
  }

  /**
   * Método auxiliar para encontrar todas las órdenes de compra
   */
  async findAll(
    page: number,
    limit: number,
    type: 'ARTICLE' | 'SERVICE'
  ): Promise<{
    data: PurchaseOrder[];
    total: number;
  }> {
    const [purchaseOrders, total] =
      await this.purchaseOrderRepository.findAndCount({
        where: {
          requirement: {
            type: type,
          },
        },
        relations: [
          'quotationRequest',
          'supplier',
          'createdBy',
          'requirement',
          'requirement.employee',
          'requirement.costCenter',
          'costCenterEntity',
        ],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      data: purchaseOrders,
      total,
    };
  }

  /**
   * Método auxiliar para eliminar una orden de compra
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.purchaseOrderRepository.softDelete(id);
  }

  /**
   * Función interna para aprobar órdenes de compra y generar grupos de pago
   * @param quotationRequestId - ID de la cotización
   * @param approvedById - ID del empleado que aprueba
   * @returns Array de PaymentGroups creados
   */
  async approvePurchaseOrders(
    purchaseOrderId: number
  ): Promise<PaymentGroup[]> {
    // Obtener todas las órdenes de compra para esta cotización
    const purchaseOrders = await this.purchaseOrderRepository.find({
      where: { id: purchaseOrderId },
      relations: [
        'supplier',
        'createdBy',
        'requirement',
        'requirement.employee',
        'requirement.costCenter',
        'costCenterEntity',
        'requirement.warehouse',
      ],
    });

    if (purchaseOrders.length === 0) {
      throw new NotFoundException(
        'No se encontraron órdenes de compra para esta cotización'
      );
    }

    const createdPaymentGroups: PaymentGroup[] = [];

    // Generar un PaymentGroup por cada orden de compra
    for (const purchaseOrder of purchaseOrders) {
      // Verificar que no existe ya un PaymentGroup para esta orden de compra
      const existingPaymentGroup = await this.paymentGroupRepository.findOne({
        where: { purchaseOrder: { id: purchaseOrder.id } },
      });

      if (existingPaymentGroup) {
        this.logger.warn(
          `Ya existe un grupo de pagos para la orden de compra ${purchaseOrder.id}`
        );
        continue;
      }

      const code = `${purchaseOrder.requirement.type === 'ARTICLE' ? 'OC' : 'OS'}-${purchaseOrder.code}-${Number(purchaseOrder.total).toFixed(0)}`;

      // Crear el PaymentGroup
      const paymentGroup = this.paymentGroupRepository.create({
        code,
        totalAmount: +purchaseOrder.total,
        pendingAmount: +purchaseOrder.total, // Inicialmente todo está pendiente
        description: `Grupo de pagos para orden de compra ${purchaseOrder.code}`,
        notes: `Generado automáticamente al aprobar.`,
        purchaseOrder: { id: purchaseOrder.id },
        approvedBy: { id: purchaseOrder.requirement.employee.id },
      });

      const savedPaymentGroup =
        await this.paymentGroupRepository.save(paymentGroup);
      createdPaymentGroups.push(savedPaymentGroup);

      this.logger.log(
        `Grupo de pagos creado: ${savedPaymentGroup.code} para orden de compra ${purchaseOrder.code}`
      );

      // Generar parte de ingreso
      await this.entryPartService.create(
        {
          warehouseId: purchaseOrder.requirement.warehouse.id,
          purchaseOrderId: purchaseOrder.id,
          observation: purchaseOrder.observation,
          entryDate: new Date().toISOString(),
          entryPartArticles: purchaseOrder.items
            .filter(item => item.type === 'ARTICLE' || !item.type)
            .map(item => ({
              articleId: item.item,
              quantity: item.quantity,
              code: item.code,
              name: item.description,
              unit: item.unit,
              received: 0,
              conform: false,
              qualityCert: false,
              guide: false,
              inspection: InspectionStatus.PENDING,
            })),
          entryPartServices: purchaseOrder.items
            .filter(item => item.type === 'SERVICE')
            .map(item => ({
              serviceId: item.item,
              duration: item.duration || 0,
              durationType: item.durationType || 'DIA',
              code: item.code,
              name: item.description,
              received: 0,
              conform: false,
              qualityCert: false,
              guide: false,
              inspection: InspectionStatus.PENDING,
            })),
        },
        EntryPartStatus.PENDING
      );
    }

    return createdPaymentGroups;
  }

  async getPurchaseOrderWithoutExitPart(
    type: 'article' | 'service'
  ): Promise<PurchaseOrder[]> {
    const purchaseOrders = await this.purchaseOrderRepository
      .find({
        relations: ['exitParts', 'requirement'],
        where: {
          requirement: { type: type.toUpperCase() as 'ARTICLE' | 'SERVICE' },
        },
        order: { createdAt: 'DESC' },
      });

    return purchaseOrders.filter(purchaseOrder => purchaseOrder.exitParts.length === 0);
  }

  async getLastPurchaseOrderByType(
    type: 'ARTICLE' | 'SERVICE'
  ): Promise<PurchaseOrder | null> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { requirement: { type } },
      order: { createdAt: 'DESC' },
    });
    if (!purchaseOrder) {
      return null;
    }
    return purchaseOrder;
  }

  // ========================================
  // SIGNATURE METHODS
  // ========================================

  /**
   * Firma una orden de compra
   */
  async signPurchaseOrder(id: number, userId: number): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);
    const employee = await this.employeeService.findOne(userId);

    if (!employee) {
      throw new NotFoundException('Empleado no encontrado');
    }

    if (!employee.signature) {
      throw new BadRequestException('El usuario no tiene firma registrada');
    }

    // Obtener el rol del empleado con sus permisos
    const role = await this.roleService.findById(employee.role.id);
    const userPermissions = role.permissions.map(p => p.name);

    // Calcular monto total
    const totalAmount = purchaseOrder.total;

    // Obtener umbral de monto bajo desde configuración
    const lowAmountThreshold =
      await this.generalSettingsService.getLowAmountThreshold();

    // Obtener configuración específica del documento
    const configurations =
      await this.documentApprovalConfigurationService.getConfigurationForDocument(
        'purchase_order',
        purchaseOrder.id
      );

    // Validaciones de negocio
    validateSignatureEligibility(
      purchaseOrder,
      userId,
      'purchase_order',
      totalAmount
    );

    // Verificar permisos usando configuración dinámica
    const { canSign, level, reason } = await canUserSignWithConfiguration(
      purchaseOrder,
      userPermissions,
      purchaseOrder.createdBy?.id || -1,
      userId,
      configurations,
      totalAmount,
      lowAmountThreshold,
      'purchase_order'
    );

    if (!canSign) {
      const errorMessage = `No puedes firmar esta orden de compra. ${reason}`;
      throw new BadRequestException(errorMessage);
    }

    // Procesar firma usando configuración dinámica
    const { updatedEntity } = await processSignatureWithConfiguration(
      purchaseOrder,
      userId,
      employee.signature,
      level,
      configurations
    );

    // Actualizar entidad
    Object.assign(purchaseOrder, updatedEntity);
    const savedPurchaseOrder =
      await this.purchaseOrderRepository.save(purchaseOrder);

    // Las órdenes de compra solo heredan firmas, no envían de vuelta
    console.log(
      `Orden de compra ${savedPurchaseOrder.id} firmada. Las firmas se heredan del origen (requerimiento o cotización)`
    );

    return savedPurchaseOrder;
  }

  /**
   * Rechaza una orden de compra
   */
  async rejectPurchaseOrder(
    id: number,
    userId: number,
    reason: string
  ): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status === PurchaseOrderStatus.APPROVED) {
      throw new BadRequestException(
        'No se puede rechazar una orden de compra aprobada'
      );
    }

    purchaseOrder.rejectedReason = reason;
    purchaseOrder.rejectedBy = userId;
    purchaseOrder.rejectedAt = new Date();
    purchaseOrder.firstSignature = null;
    purchaseOrder.firstSignedBy = null;
    purchaseOrder.firstSignedAt = null;
    purchaseOrder.secondSignature = null;
    purchaseOrder.secondSignedBy = null;
    purchaseOrder.secondSignedAt = null;
    purchaseOrder.thirdSignature = null;
    purchaseOrder.thirdSignedBy = null;
    purchaseOrder.thirdSignedAt = null;
    purchaseOrder.fourthSignature = null;
    purchaseOrder.fourthSignedBy = null;
    purchaseOrder.fourthSignedAt = null;
    purchaseOrder.status = PurchaseOrderStatus.REJECTED;

    return this.purchaseOrderRepository.save(purchaseOrder);
  }

  /**
   * Guarda una orden de compra con firmas copiadas desde la cotización
   */
  async savePurchaseOrderWithSignatures(
    purchaseOrder: PurchaseOrder
  ): Promise<PurchaseOrder> {
    const savedPurchaseOrder = await this.purchaseOrderRepository.save(
      purchaseOrder
    );

    // Si la orden de compra fue aprobada, generar órdenes de compra
    if (savedPurchaseOrder.status === PurchaseOrderStatus.APPROVED) {
      this.approvePurchaseOrders(savedPurchaseOrder.id);
    }

    return savedPurchaseOrder;
  }

  /**
   * Obtiene la configuración de firmas para una orden de compra
   */
  async getSignatureConfiguration(id: number) {
    const purchaseOrder = await this.findOne(id);

    // Obtener configuración específica del documento
    const configurations =
      await this.documentApprovalConfigurationService.getConfigurationForDocument(
        'purchase_order',
        purchaseOrder.id
      );

    return {
      purchaseOrder,
      configurations,
      totalAmount: purchaseOrder.total,
      lowAmountThreshold:
        await this.generalSettingsService.getLowAmountThreshold(),
    };
  }

  async getRequirement(requirementId: number): Promise<Requirement> {
    const requirement = await this.requirementRepository.findOne({
      where: { id: requirementId },
      relations: ['warehouse', 'costCenter'],
    });
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }
    return requirement;
  }
}
