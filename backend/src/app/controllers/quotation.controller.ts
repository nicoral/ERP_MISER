import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { QuotationService } from '../services/quotation.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { CreateQuotationRequestDto } from '../dto/quotation/create-quotation-request.dto';
import { UpdateQuotationRequestDto } from '../dto/quotation/update-quotation-request.dto';
import { CreateSupplierQuotationDto } from '../dto/quotation/create-supplier-quotation.dto';
import {
  UpdateSupplierQuotationDto,
  UpdateSupplierQuotationOcDto,
} from '../dto/quotation/update-supplier-quotation.dto';
import { UpdateQuotationBasicDto } from '../dto/quotation/update-quotation-basic.dto';
import {
  UpdateQuotationOrderDto,
  ApplyGeneralTermsDto,
} from '../dto/quotation/update-quotation-order.dto';
import { SendQuotationOrderDto } from '../dto/quotation/update-quotation-order.dto';
import { CreateFinalSelectionDto } from '../dto/quotation/create-final-selection.dto';
import { UpdateFinalSelectionDto } from '../dto/quotation/update-final-selection.dto';
import { QuotationFiltersDto } from '../dto/quotation/filters-quotation.dto';
import { GeneratePurchaseOrderDto } from '../dto/quotation/generate-purchase-order.dto';

@Controller('quotation')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Post()
  @RequirePermissions('create_quotation')
  @AuditDescription('Crear solicitud de cotización')
  create(
    @Body() createQuotationRequestDto: CreateQuotationRequestDto,
    @Request() req: { user: { id: number } }
  ) {
    return this.quotationService.createQuotationRequest(
      req.user.id,
      createQuotationRequestDto
    );
  }

  @Get()
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener todas las solicitudes de cotización')
  findAll(
    @Request() req: { user: { id: number } },
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query() filters: QuotationFiltersDto
  ) {
    return this.quotationService.findAllQuotationRequests(
      req.user.id,
      page,
      limit,
      filters
    );
  }

  @Get(':id')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener solicitud de cotización por ID')
  findOne(@Param('id') id: string) {
    return this.quotationService.findOneQuotationRequest(+id);
  }

  @Get('requirement/:requirementId')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener solicitud de cotización por requerimiento')
  findByRequirement(@Param('requirementId') requirementId: string) {
    return this.quotationService.getQuotationRequestByRequirement(
      +requirementId
    );
  }

  @Get('statistics/status')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener estadísticas de cotizaciones')
  getStatistics() {
    return this.quotationService.getQuotationStatistics();
  }

  @Patch(':id')
  @RequirePermissions('update_quotation')
  @AuditDescription('Actualizar solicitud de cotización')
  update(
    @Req() req: { user: { id: number } },
    @Param('id') id: string,
    @Body() updateQuotationRequestDto: UpdateQuotationRequestDto
  ) {
    return this.quotationService.updateQuotationRequest(
      req.user.id,
      +id,
      updateQuotationRequestDto
    );
  }

  @Patch(':id/cancel')
  @RequirePermissions('update_quotation')
  @AuditDescription('Cancelar solicitud de cotización')
  cancel(@Param('id') id: string) {
    return this.quotationService.cancelQuotationRequest(+id);
  }

  @Delete(':id')
  @RequirePermissions('delete_quotation')
  @AuditDescription('Eliminar solicitud de cotización')
  remove(@Param('id') id: string) {
    return this.quotationService.removeQuotationRequest(+id);
  }

  @Post(':id/sign')
  @RequirePermissions('view_quotations')
  @AuditDescription('Firmar solicitud de cotización')
  sign(@Req() req: { user: { id: number } }, @Param('id') id: string) {
    return this.quotationService.signQuotationRequest(+id, req.user.id);
  }

  @Post(':id/reject')
  @RequirePermissions('view_quotations')
  @AuditDescription('Rechazar solicitud de cotización')
  reject(
    @Req() req: { user: { id: number } },
    @Param('id') id: string,
    @Body() body: { reason: string }
  ) {
    return this.quotationService.rejectQuotationRequest(
      +id,
      req.user.id,
      body.reason
    );
  }

  // Supplier Quotations
  @Post('supplier-quotation')
  @RequirePermissions('create_quotation')
  @AuditDescription('Crear cotización de proveedor')
  createSupplierQuotation(
    @Body() createSupplierQuotationDto: CreateSupplierQuotationDto
  ) {
    return this.quotationService.createSupplierQuotation(
      createSupplierQuotationDto
    );
  }

  @Get('supplier-quotation/:id')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener cotización de proveedor por ID')
  findSupplierQuotation(@Param('id') id: string) {
    return this.quotationService.findOneSupplierQuotation(+id);
  }

  @Get('supplier-quotation/request/:quotationRequestId')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener cotizaciones de proveedores por solicitud')
  findSupplierQuotationsByRequest(
    @Param('quotationRequestId') quotationRequestId: string
  ) {
    return this.quotationService.findAllSupplierQuotations(+quotationRequestId);
  }

  @Patch('supplier-quotation/:id')
  @RequirePermissions('update_quotation')
  @AuditDescription('Actualizar cotización de proveedor')
  updateSupplierQuotation(
    @Param('id') id: string,
    @Body() updateSupplierQuotationDto: UpdateSupplierQuotationDto
  ) {
    return this.quotationService.updateSupplierQuotation(
      +id,
      updateSupplierQuotationDto
    );
  }

  @Patch('supplier-quotation/:id/oc')
  @RequirePermissions('update_quotation')
  @AuditDescription('Actualizar cotización de proveedor')
  updateSupplierQuotationOc(
    @Param('id') id: string,
    @Body() updateSupplierQuotationDto: UpdateSupplierQuotationOcDto
  ) {
    return this.quotationService.updateSupplierQuotationOc(
      +id,
      updateSupplierQuotationDto
    );
  }

  @Patch('supplier-quotation/:id/submit')
  @RequirePermissions('update_quotation')
  @AuditDescription('Enviar cotización de proveedor')
  submitSupplierQuotation(@Param('id') id: string) {
    return this.quotationService.submitSupplierQuotation(+id);
  }

  // Basic update for quotation request
  @Patch(':id/basic')
  @RequirePermissions('update_quotation')
  @AuditDescription('Actualizar información básica de solicitud de cotización')
  updateBasic(
    @Req() req: { user: { id: number } },
    @Param('id') id: string,
    @Body() updateQuotationBasicDto: UpdateQuotationBasicDto
  ) {
    return this.quotationService.updateQuotationRequest(
      req.user.id,
      +id,
      updateQuotationBasicDto
    );
  }

  // Quotation Order endpoints
  @Patch(':id/order')
  @RequirePermissions('update_quotation')
  @AuditDescription('Actualizar orden de cotización')
  updateQuotationOrder(
    @Param('id') id: string,
    @Body() updateQuotationOrderDto: UpdateQuotationOrderDto
  ) {
    return this.quotationService.updateQuotationOrder(
      +id,
      updateQuotationOrderDto
    );
  }

  @Patch(':id/order/send')
  @RequirePermissions('update_quotation')
  @AuditDescription('Enviar orden de cotización')
  sendQuotationOrder(
    @Param('id') id: string,
    @Body() sendQuotationOrderDto: SendQuotationOrderDto
  ) {
    return this.quotationService.sendQuotationOrder(+id, sendQuotationOrderDto);
  }

  @Patch(':id/orders/send-all')
  @RequirePermissions('update_quotation')
  @AuditDescription('Enviar todas las órdenes de cotización')
  sendAllQuotationOrders(@Param('id') id: string) {
    return this.quotationService.sendAllQuotationOrders(+id);
  }

  // Final Selection endpoints
  @Post('final-selection')
  @RequirePermissions('create_quotation')
  @AuditDescription('Crear selección final')
  createFinalSelection(
    @Body() createFinalSelectionDto: CreateFinalSelectionDto
  ) {
    return this.quotationService.createFinalSelection(createFinalSelectionDto);
  }

  @Get('final-selection/request/:quotationRequestId')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener selección final por solicitud de cotización')
  findFinalSelectionByRequest(
    @Param('quotationRequestId') quotationRequestId: string
  ) {
    return this.quotationService.findFinalSelectionByRequest(
      +quotationRequestId
    );
  }

  @Get('final-selection/:id')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener selección final por ID')
  findFinalSelection(@Param('id') id: string) {
    return this.quotationService.findOneFinalSelection(+id);
  }

  @Patch('final-selection/:id')
  @RequirePermissions('update_quotation')
  @AuditDescription('Actualizar selección final')
  updateFinalSelection(
    @Param('id') id: string,
    @Body() updateFinalSelectionDto: UpdateFinalSelectionDto
  ) {
    return this.quotationService.updateFinalSelection(
      +id,
      updateFinalSelectionDto
    );
  }

  @Patch('final-selection/:id/approve')
  @RequirePermissions('update_quotation')
  @AuditDescription('Aprobar selección final')
  approveFinalSelection(@Param('id') id: string) {
    return this.quotationService.approveFinalSelection(+id);
  }

  @Post('final-selection/:id/generate-purchase-order')
  @RequirePermissions('create_quotation')
  @AuditDescription('Generar orden de compra para proveedor específico')
  generatePurchaseOrder(
    @Param('id') id: string,
    @Body() generatePurchaseOrderDto: GeneratePurchaseOrderDto
  ) {
    return this.quotationService.generatePurchaseOrder(
      +id,
      +generatePurchaseOrderDto.supplierId,
      generatePurchaseOrderDto.paymentMethod
    );
  }

  @Delete('final-selection/:id')
  @RequirePermissions('delete_quotation')
  @AuditDescription('Eliminar selección final')
  removeFinalSelection(@Param('id') id: string) {
    return this.quotationService.removeFinalSelection(+id);
  }

  @Patch(':id/apply-general-terms')
  @RequirePermissions('update_quotation')
  @AuditDescription('Aplicar términos generales en masa')
  applyGeneralTerms(
    @Param('id') id: string,
    @Body() applyGeneralTermsDto: ApplyGeneralTermsDto
  ) {
    return this.quotationService.applyGeneralTermsToAll(
      +id,
      applyGeneralTermsDto
    );
  }

  @Get(':id/purchase-request/:supplierId/pdf')
  @RequirePermissions('view_quotations')
  @AuditDescription('Descargar PDF de solicitud de compra para proveedor')
  async downloadPurchaseRequestPdf(
    @Param('id') id: string,
    @Param('supplierId') supplierId: string,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.quotationService.generatePurchaseRequestPdf(
      +id,
      +supplierId
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="solicitud_compra_${id}_${supplierId}.pdf"`,
    });
    res.end(pdfBuffer);
  }

  @Get(':id/supplier/:supplierId/comparison/pdf')
  @RequirePermissions('view_quotations')
  @AuditDescription('Descargar PDF del cuadro comparativo de cotizaciones')
  async downloadQuotationComparisonPdf(
    @Param('id') id: string,
    @Param('supplierId') supplierId: string,
    @Res() res: Response
  ) {
    try {
      const pdfBuffer =
        await this.quotationService.generateQuotationComparisonPdf(
          +id,
          +supplierId
        );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="comparacion-cotizacion-${id}-${supplierId}.pdf"`,
      });

      res.end(pdfBuffer);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  }
}
