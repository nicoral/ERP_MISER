import { createApiCall } from './httpInterceptor';
import type { PurchaseOrder } from '../../types/purchaseOrder';
import type { PaginatedResponse } from '../../types/generic';
import type { SignatureConfigurationResponse } from '../../types/documentApprovalConfiguration';

const BASE_URL = `${import.meta.env.VITE_API_URL}/purchase-order`;

export const purchaseOrderService = {
  // Obtener todas las órdenes de compra
  async getAllPurchaseOrders(
    page: number,
    limit: number,
    type: 'ARTICLE' | 'SERVICE'
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    queryParams.append('type', type);

    const response = await createApiCall<{
      data: PurchaseOrder[];
      total: number;
      page: number;
      limit: number;
    }>(`${BASE_URL}?${queryParams.toString()}`, {
      method: 'GET',
    });
    return {
      data: response.data,
      total: response.total,
      page: response.page,
      pageSize: response.limit,
      totalPages: Math.ceil(response.total / response.limit),
    };
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

  async getPurchaseOrderWithoutExitPart(
    type: 'article' | 'service'
  ): Promise<PurchaseOrder[]> {
    const response = await createApiCall<PurchaseOrder[]>(
      `${BASE_URL}/without-exit-part/summary?type=${type}`,
      { method: 'GET' }
    );
    return response;
  },

  // Obtener configuración de firmas de una orden de compra
  async getSignatureConfiguration(
    id: number
  ): Promise<SignatureConfigurationResponse> {
    const response = await createApiCall<SignatureConfigurationResponse>(
      `${BASE_URL}/${id}/signature-configuration`,
      {
        method: 'GET',
      }
    );
    return response;
  },
};

export default purchaseOrderService;
