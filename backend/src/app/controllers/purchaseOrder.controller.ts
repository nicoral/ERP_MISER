import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
  Post,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { PurchaseOrderService } from '../services/purchaseOrder.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { AuditDescription } from '../common/decorators/audit-description.decorator';
import { UpdatePurchaseOrderDto } from '../dto/purchaseOrder/update-purchase-order.dto';

@Controller('purchase-order')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Get()
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener todas las órdenes de compra')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type: 'ARTICLE' | 'SERVICE' = 'ARTICLE'
  ) {
    return this.purchaseOrderService.findAll(+page, +limit, type);
  }

  @Get(':id')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener orden de compra por ID')
  findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findOne(+id);
  }

  @Get('quotation/:quotationRequestId/supplier/:supplierId')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener órdenes de compra por cotización y proveedor')
  findByQuotation(
    @Param('quotationRequestId') quotationRequestId: string,
    @Param('supplierId') supplierId: string
  ) {
    return this.purchaseOrderService.findByQuotation(
      +quotationRequestId,
      +supplierId
    );
  }

  @Get('requirement/:requirementId/supplier/:supplierId')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener órdenes de compra por requerimiento y proveedor')
  findByRequirement(
    @Param('requirementId') requirementId: string,
    @Param('supplierId') supplierId: string
  ) {
    return this.purchaseOrderService.findByRequirement(
      +requirementId,
      +supplierId
    );
  }

  @Get('quotation/:quotationRequestId/summary')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener resumen de órdenes de compra por cotización')
  getQuotationSummary(@Param('quotationRequestId') quotationRequestId: string) {
    return this.purchaseOrderService.getQuotationSummary(+quotationRequestId);
  }

  @Patch(':id')
  @RequirePermissions('update_quotation')
  @AuditDescription('Actualizar orden de compra')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto
  ) {
    return this.purchaseOrderService.updatePurchaseOrderPayment(
      +id,
      updatePurchaseOrderDto
    );
  }

  @Delete(':id')
  @RequirePermissions('delete_quotation')
  @AuditDescription('Eliminar orden de compra')
  remove(@Param('id') id: string) {
    return this.purchaseOrderService.remove(+id);
  }

  // ========================================
  // SIGNATURE ENDPOINTS
  // ========================================

  @Post(':id/sign')
  @RequirePermissions('view_quotations')
  @AuditDescription('Firmar orden de compra')
  sign(@Req() req: { user: { id: number } }, @Param('id') id: string) {
    return this.purchaseOrderService.signPurchaseOrder(+id, req.user.id);
  }

  @Post(':id/reject')
  @RequirePermissions('view_quotations')
  @AuditDescription('Rechazar orden de compra')
  reject(
    @Req() req: { user: { id: number } },
    @Param('id') id: string,
    @Body() body: { reason: string }
  ) {
    return this.purchaseOrderService.rejectPurchaseOrder(
      +id,
      req.user.id,
      body.reason
    );
  }

  @Get(':id/signature-configuration')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener configuración de firmas')
  getSignatureConfiguration(@Param('id') id: string) {
    return this.purchaseOrderService.getSignatureConfiguration(+id);
  }

  @Get(':id/pdf')
  @RequirePermissions('view_quotations')
  @AuditDescription('Descargar PDF de orden de compra')
  async downloadPurchaseOrderPdf(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    const pdfBuffer =
      await this.purchaseOrderService.generatePurchaseOrderPdf(+id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="orden_compra.pdf"',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Get('without-exit-part/summary')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener órdenes de compra sin parte de salida')
  getPurchaseOrderWithoutExitPart(
    @Query('type') type: 'article' | 'service'
  ) {
    return this.purchaseOrderService.getPurchaseOrderWithoutExitPart(type);
  }
}
