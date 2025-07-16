import { createApiCall } from './httpInterceptor';
import type { PurchaseOrder } from '../../types/purchaseOrder';

const BASE_URL = `${import.meta.env.VITE_API_URL}/purchase-order`;

export const purchaseOrderService = {
  // Obtener todas las órdenes de compra
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    const response = await createApiCall<PurchaseOrder[]>(BASE_URL, {
      method: 'GET',
    });
    return response;
  },

  // Obtener órdenes de compra por cotización y proveedor
  async getByQuotationAndSupplier(
    quotationRequestId: number,
    supplierId: number
  ): Promise<PurchaseOrder> {
    const response = await createApiCall<PurchaseOrder>(
      `${BASE_URL}/quotation/${quotationRequestId}/supplier/${supplierId}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async getById(id: number): Promise<PurchaseOrder> {
    const response = await createApiCall<PurchaseOrder>(`${BASE_URL}/${id}`, {
      method: 'GET',
    });
    return response;
  },

  // Obtener resumen de órdenes de compra por cotización
  async getQuotationSummary(quotationRequestId: number): Promise<{
    totalPurchaseOrders: number;
    totalSuppliersWithFinalSelection: number;
    canSignFirstSignature: boolean;
  }> {
    const response = await createApiCall<{
      totalPurchaseOrders: number;
      totalSuppliersWithFinalSelection: number;
      canSignFirstSignature: boolean;
    }>(`${BASE_URL}/quotation/${quotationRequestId}/summary`, {
      method: 'GET',
    });
    return response;
  },

  // Obtener órdenes de compra por requerimiento
  async getByRequirement(requirementId: number): Promise<PurchaseOrder[]> {
    const response = await createApiCall<PurchaseOrder[]>(
      `${BASE_URL}/requirement/${requirementId}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  // Actualizar orden de compra
  async updatePurchaseOrder(
    id: number,
    data: { igv?: number; paymentMethod?: string; observation?: string }
  ): Promise<PurchaseOrder> {
    const response = await createApiCall<PurchaseOrder>(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response;
  },

  // Descargar PDF de orden de compra
  async downloadPurchaseOrderPdf(id: number): Promise<Blob> {
    const response = await createApiCall<Blob>(
      `${BASE_URL}/${id}/pdf`,
      {
        method: 'GET',
      },
      true
    );
    return response;
  },

  async getPurchaseOrderWithoutExitPart(): Promise<PurchaseOrder[]> {
    const response = await createApiCall<PurchaseOrder[]>(
      `${BASE_URL}/without-exit-part/summary`,
      { method: 'GET' }
    );
    return response;
  },
};

export default purchaseOrderService;
