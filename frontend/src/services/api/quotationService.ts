import { createApiCall } from './httpInterceptor';
import type {
  QuotationRequest,
  CreateQuotationRequestDto,
  UpdateQuotationRequestDto,
  SupplierQuotation,
  CreateSupplierQuotationDto,
  UpdateSupplierQuotationDto,
  FinalSelection,
  CreateFinalSelectionDto,
  UpdateFinalSelectionDto,
  UpdateQuotationBasicDto,
  UpdateQuotationOrderDto,
  SendQuotationOrderDto,
  ApplyGeneralTermsDto,
  QuotationFilters,
  UpdateSupplierQuotationOcDto,
} from '../../types/quotation';
import { STORAGE_KEY_TOKEN } from '../../config/constants';

const BASE_URL = `${import.meta.env.VITE_API_URL}/quotation`;

export const quotationService = {
  // QuotationRequest endpoints
  async createQuotationRequest(
    data: CreateQuotationRequestDto
  ): Promise<QuotationRequest> {
    const response = await createApiCall<QuotationRequest>(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  async getQuotationRequests(
    page: number,
    limit: number,
    filters?: QuotationFilters
  ): Promise<{ quotationRequests: QuotationRequest[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.supplierId)
      params.append('supplierId', filters.supplierId.toString());
    if (filters?.dateFrom)
      params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters?.dateTo) params.append('dateTo', filters.dateTo.toISOString());
    if (filters?.search) params.append('search', filters.search);

    const response = await createApiCall<{
      quotationRequests: QuotationRequest[];
      total: number;
    }>(`${BASE_URL}?page=${page}&limit=${limit}&${params.toString()}`, {
      method: 'GET',
    });
    return response;
  },

  async getQuotationRequest(id: number): Promise<QuotationRequest> {
    const response = await createApiCall<QuotationRequest>(
      `${BASE_URL}/${id}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async getQuotationByRequirement(
    requirementId: number
  ): Promise<QuotationRequest | null> {
    const response = await createApiCall<QuotationRequest | null>(
      `${BASE_URL}/requirement/${requirementId}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async getQuotationStatistics(): Promise<{
    PENDING: number;
    DRAFT: number;
    ACTIVE: number;
    CANCELLED: number;
    SIGNED_1: number;
    SIGNED_2: number;
    SIGNED_3: number;
    APPROVED: number;
    REJECTED: number;
  }> {
    const response = await createApiCall<{
      PENDING: number;
      DRAFT: number;
      ACTIVE: number;
      CANCELLED: number;
      SIGNED_1: number;
      SIGNED_2: number;
      SIGNED_3: number;
      APPROVED: number;
      REJECTED: number;
    }>(`${BASE_URL}/statistics/status`, {
      method: 'GET',
    });
    return response;
  },

  async updateQuotationRequest(
    id: number,
    data: UpdateQuotationRequestDto
  ): Promise<QuotationRequest> {
    const response = await createApiCall<QuotationRequest>(
      `${BASE_URL}/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async deleteQuotationRequest(id: number): Promise<void> {
    const response = await createApiCall<void>(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response;
  },

  async updateQuotationBasic(
    id: number,
    data: UpdateQuotationBasicDto
  ): Promise<QuotationRequest> {
    const response = await createApiCall<QuotationRequest>(
      `${BASE_URL}/${id}/basic`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  // Supplier Quotation endpoints
  async createSupplierQuotation(
    data: CreateSupplierQuotationDto
  ): Promise<SupplierQuotation> {
    const response = await createApiCall<SupplierQuotation>(
      `${BASE_URL}/supplier-quotation`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async getSupplierQuotation(id: number): Promise<SupplierQuotation> {
    const response = await createApiCall<SupplierQuotation>(
      `${BASE_URL}/supplier-quotation/${id}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async getSupplierQuotationsByRequest(
    quotationRequestId: number
  ): Promise<SupplierQuotation[]> {
    const response = await createApiCall<SupplierQuotation[]>(
      `${BASE_URL}/supplier-quotation/request/${quotationRequestId}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async updateSupplierQuotation(
    id: number,
    data: UpdateSupplierQuotationDto
  ): Promise<SupplierQuotation> {
    const response = await createApiCall<SupplierQuotation>(
      `${BASE_URL}/supplier-quotation/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async updateSupplierQuotationOc(
    id: number,
    data: UpdateSupplierQuotationOcDto
  ): Promise<SupplierQuotation> {
    const response = await createApiCall<SupplierQuotation>(
      `${BASE_URL}/supplier-quotation/${id}/oc`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async submitSupplierQuotation(id: number): Promise<SupplierQuotation> {
    const response = await createApiCall<SupplierQuotation>(
      `${BASE_URL}/supplier-quotation/${id}/submit`,
      {
        method: 'PATCH',
      }
    );
    return response;
  },

  // Final Selection endpoints
  async createFinalSelection(
    data: CreateFinalSelectionDto
  ): Promise<FinalSelection> {
    const response = await createApiCall<FinalSelection>(
      `${BASE_URL}/final-selection`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async getFinalSelection(id: number): Promise<FinalSelection> {
    const response = await createApiCall<FinalSelection>(
      `${BASE_URL}/final-selection/${id}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async getFinalSelectionByRequest(
    quotationRequestId: number
  ): Promise<FinalSelection> {
    const response = await createApiCall<FinalSelection>(
      `${BASE_URL}/final-selection/request/${quotationRequestId}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async updateFinalSelection(
    id: number,
    data: UpdateFinalSelectionDto
  ): Promise<FinalSelection> {
    const response = await createApiCall<FinalSelection>(
      `${BASE_URL}/final-selection/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async approveFinalSelection(id: number): Promise<FinalSelection> {
    const response = await createApiCall<FinalSelection>(
      `${BASE_URL}/final-selection/${id}/approve`,
      {
        method: 'PATCH',
      }
    );
    return response;
  },

  async downloadPurchaseRequestPdf(
    quotationId: number,
    supplierId: number
  ): Promise<Blob> {
    const response = await fetch(
      `${BASE_URL}/${quotationId}/purchase-request/${supplierId}/pdf`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
        },
      }
    );
    if (!response.ok) throw new Error('No se pudo descargar el PDF');
    return await response.blob();
  },

  async downloadQuotationComparisonPdf(
    quotationId: number,
    supplierId: number
  ): Promise<Blob> {
    const response = await fetch(
      `${BASE_URL}/${quotationId}/supplier/${supplierId}/comparison/pdf`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
        },
      }
    );
    if (!response.ok) throw new Error('No se pudo descargar el PDF');
    return await response.blob();
  },

  async downloadPurchaseOrderPdf(
    quotationId: number,
    supplierId: number
  ): Promise<Blob> {
    const response = await fetch(
      `${BASE_URL}/${quotationId}/purchase-order/${supplierId}/pdf`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEY_TOKEN)}`,
        },
      }
    );
    if (!response.ok) throw new Error('No se pudo descargar el PDF');
    return await response.blob();
  },

  // Quotation Order endpoints
  async updateQuotationOrder(
    quotationRequestId: number,
    data: UpdateQuotationOrderDto
  ): Promise<QuotationRequest> {
    const response = await createApiCall<QuotationRequest>(
      `${BASE_URL}/${quotationRequestId}/order`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async sendQuotationOrder(
    quotationRequestId: number,
    data: SendQuotationOrderDto
  ): Promise<QuotationRequest> {
    const response = await createApiCall<QuotationRequest>(
      `${BASE_URL}/${quotationRequestId}/order/send`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async sendAllQuotationOrders(
    quotationRequestId: number
  ): Promise<QuotationRequest> {
    const response = await createApiCall<QuotationRequest>(
      `${BASE_URL}/${quotationRequestId}/orders/send-all`,
      {
        method: 'PATCH',
      }
    );
    return response;
  },

  async applyGeneralTermsToAll(
    quotationRequestId: number,
    data: ApplyGeneralTermsDto
  ): Promise<QuotationRequest> {
    const response = await createApiCall<QuotationRequest>(
      `${BASE_URL}/${quotationRequestId}/apply-general-terms`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  // Approval flow endpoints
  async signQuotationRequest(id: number): Promise<QuotationRequest> {
    const response = await createApiCall<QuotationRequest>(
      `${BASE_URL}/${id}/sign`,
      {
        method: 'POST',
      }
    );
    return response;
  },

  async rejectQuotationRequest(
    id: number,
    reason: string
  ): Promise<QuotationRequest> {
    const response = await createApiCall<QuotationRequest>(
      `${BASE_URL}/${id}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
    return response;
  },
};

export default quotationService;
