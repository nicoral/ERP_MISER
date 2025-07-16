import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
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
  findAll() {
    return this.purchaseOrderService.findAll();
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
    return this.purchaseOrderService.updatePurchaseOrder(
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

  @Get(':id/pdf')
  @RequirePermissions('view_quotations')
  @AuditDescription('Descargar PDF de orden de compra')
  async downloadPurchaseOrderPdf(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try {
      const pdfBuffer =
        await this.purchaseOrderService.generatePurchaseOrderPdf(+id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="orden-compra-${id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      res.status(500).json({
        message: 'Error al generar el PDF',
        error: error.message,
      });
    }
  }

  @Get('without-exit-part/summary')
  @RequirePermissions('view_quotations')
  @AuditDescription('Obtener órdenes de compra sin salida')
  getPurchaseOrderWithoutExitPart() {
    return this.purchaseOrderService.getPurchaseOrderWithoutExitPart();
  }
}
