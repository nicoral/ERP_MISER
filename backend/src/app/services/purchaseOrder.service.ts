import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from '../entities/PurchaseOrder.entity';
import { QuotationRequest } from '../entities/QuotationRequest.entity';
import { PaymentGroup } from '../entities/PaymentGroup.entity';
import { QRService } from './qr.service';
import { CreatePurchaseOrderDto } from '../dto/purchaseOrder/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from '../dto/purchaseOrder/update-purchase-order.dto';

import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { numberToSpanishWordsCurrency } from '../utils/utils';
import { EntryPartService } from './entryPart.service';
import { EntryPartStatus, InspectionStatus } from '../common/enum';

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
    private readonly qrService: QRService,
    private readonly entryPartService: EntryPartService
  ) {}

  // ========================================
  // PUBLIC ENDPOINTS
  // ========================================

  /**
   * 1. Obtener PurchaseOrder por quotation
   */
  async findByQuotation(
    quotationRequestId: number,
    supplierId: number
  ): Promise<PurchaseOrder> {
    const purchaseOrders = await this.purchaseOrderRepository.findOne({
      where: {
        quotationRequest: { id: quotationRequestId },
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
      order: { createdAt: 'DESC' },
    });

    if (!purchaseOrders) {
      throw new NotFoundException(
        'No se encontraron órdenes de compra para esta cotización'
      );
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
      order: { createdAt: 'DESC' },
    });

    if (!purchaseOrders) {
      throw new NotFoundException(
        'No se encontraron órdenes de compra para este requerimiento'
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

    // Contar proveedores únicos en la selección final
    const suppliersWithFinalSelection = new Set(
      quotationRequest.finalSelection.finalSelectionItems.map(
        item => item.supplier.id
      )
    );
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
  async updatePurchaseOrder(
    id: number,
    updatePurchaseOrderDto: UpdatePurchaseOrderDto
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

  /**
   * 6. Generador de PDF
   */
  async generatePurchaseOrderPdf(id: number): Promise<Buffer> {
    const purchaseOrder = await this.findOne(id);
    // Generar QR para la orden de compra
    const qrUrl = this.qrService.generateQuotationURL(
      purchaseOrder.quotationRequest.id,
      {
        includeTimestamp: true,
        includeVersion: true,
        version: '1.0',
      }
    );
    const qrDataUrl = await this.qrService.generateQRCode(qrUrl);

    // Preparar datos para el template
    const data = {
      code: purchaseOrder.code,
      date: purchaseOrder.issueDate
        ? new Date(purchaseOrder.issueDate)
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '/')
        : new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
      orderNumber: purchaseOrder.orderNumber,
      issueDate: purchaseOrder.issueDate
        ? new Date(purchaseOrder.issueDate).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : new Date().toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),

      // Datos del comprador (MYSER)
      buyerName: purchaseOrder.buyerName,
      buyerRUC: purchaseOrder.buyerRUC,
      buyerAddress: purchaseOrder.buyerAddress,
      buyerLocation: purchaseOrder.buyerLocation || '',
      buyerPhone: purchaseOrder.buyerPhone || '',

      // Datos del proveedor
      supplierName: purchaseOrder.supplierName,
      supplierRUC: purchaseOrder.supplierRUC,
      supplierAddress: purchaseOrder.supplierAddress,
      supplierLocation: purchaseOrder.supplierLocation || '',
      supplierPhone: purchaseOrder.supplierPhone || '',

      // Datos del requerimiento (por relación)
      requirementNumber: purchaseOrder.requirement?.code || '-',
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

      // Firmas (de la quotation)
      firstSignature: purchaseOrder.quotationRequest.firstSignature,
      firstSignedAt: purchaseOrder.quotationRequest.firstSignedAt
        ? purchaseOrder.quotationRequest.firstSignedAt.toLocaleDateString(
            'es-PE',
            {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }
          )
        : '',
      secondSignature: purchaseOrder.quotationRequest.secondSignature,
      secondSignedAt: purchaseOrder.quotationRequest.secondSignedAt
        ? purchaseOrder.quotationRequest.secondSignedAt.toLocaleDateString(
            'es-PE',
            {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }
          )
        : '',
      thirdSignature: purchaseOrder.quotationRequest.thirdSignature,
      thirdSignedAt: purchaseOrder.quotationRequest.thirdSignedAt
        ? purchaseOrder.quotationRequest.thirdSignedAt.toLocaleDateString(
            'es-PE',
            {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }
          )
        : '',
      fourthSignature: purchaseOrder.quotationRequest.fourthSignature,
      fourthSignedAt: purchaseOrder.quotationRequest.fourthSignedAt
        ? purchaseOrder.quotationRequest.fourthSignedAt.toLocaleDateString(
            'es-PE',
            {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }
          )
        : '',

      // QR Code
      qrCode: qrDataUrl,
    };

    // Leer y compilar el template
    const templateHtml = fs.readFileSync(
      path.join(__dirname, '../../templates/purchase-order.template.html'),
      'utf8'
    );
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

  // ========================================
  // PRIVATE METHODS
  // ========================================

  /**
   * 4. Creación de PurchaseOrder (método privado)
   */
  async createPurchaseOrder(
    createPurchaseOrderDto: CreatePurchaseOrderDto
  ): Promise<PurchaseOrder> {
    const { quotationRequestId, supplierId, createdById, ...purchaseOrderDto } =
      createPurchaseOrderDto;
    const quotationRequest = await this.quotationRequestRepository.findOne({
      where: { id: quotationRequestId },
      relations: [
        'requirement',
        'requirement.warehouse',
        'requirement.costCenter',
      ],
    });
    if (!quotationRequest) {
      throw new NotFoundException('Cotización no encontrada');
    }
    const { requirement } = quotationRequest;
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
      quotationRequest: { id: quotationRequestId },
      supplier: { id: supplierId },
      createdBy: { id: createdById },
      requirement: { id: requirement.id },
      costCenterEntity: { id: requirement.costCenter.id },
      observation: requirement.observation || null,
      code: '1234567890',
    };

    // Crear la entidad directamente
    const purchaseOrder = new PurchaseOrder();
    Object.assign(purchaseOrder, purchaseOrderData);

    // Guardamos para obtener el ID
    const savedPurchaseOrder =
      await this.purchaseOrderRepository.save(purchaseOrder);

    // Generamos el código con el formato: {warehouse_id}-{purchase_order_id}
    const warehouseId =
      quotationRequest.requirement?.warehouse?.id.toString().padStart(3, '0') ||
      '001';
    const purchaseOrderId = savedPurchaseOrder.id.toString().padStart(6, '0');
    const code = `${warehouseId}-${purchaseOrderId}`;

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
  async findAll(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.find({
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
    quotationRequestId: number
  ): Promise<PaymentGroup[]> {
    // Obtener todas las órdenes de compra para esta cotización
    const purchaseOrders = await this.purchaseOrderRepository.find({
      where: { quotationRequest: { id: quotationRequestId } },
      relations: [
        'quotationRequest',
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

      // Generar código único para el PaymentGroup
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const timestamp = Date.now();
      const code = `PAY-${year}${month}${day}-${purchaseOrder.id}-${timestamp}`;

      // Crear el PaymentGroup
      const paymentGroup = this.paymentGroupRepository.create({
        code,
        totalAmount: +purchaseOrder.total,
        pendingAmount: +purchaseOrder.total, // Inicialmente todo está pendiente
        description: `Grupo de pagos para orden de compra ${purchaseOrder.code}`,
        notes: `Generado automáticamente al aprobar la cotización ${purchaseOrder.quotationRequest.code}`,
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
          entryPartArticles: purchaseOrder.items.map(item => ({
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
        },
        EntryPartStatus.PENDING
      );
    }

    return createdPaymentGroups;
  }
}
