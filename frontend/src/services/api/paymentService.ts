import { createApiCall } from './httpInterceptor';
import type {
  PaymentGroup,
  PaymentGroupFilters,
  PaymentStatistics,
  PaymentDetail,
  CreatePaymentDetailDto,
} from '../../types/payment';

const BASE_URL = `${import.meta.env.VITE_API_URL}/payments`;

const paymentService = {
  // Payment Group endpoints
  async getPaymentGroups(
    type: 'ARTICLE' | 'SERVICE',
    page: number,
    limit: number,
    filters?: PaymentGroupFilters
  ): Promise<{ data: PaymentGroup[]; total: number }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      type: type,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.approvedBy && { approvedBy: filters.approvedBy.toString() }),
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters?.dateTo && { dateTo: filters.dateTo }),
    });

    const response = await createApiCall<{
      data: PaymentGroup[];
      total: number;
    }>(`${BASE_URL}/groups?${queryParams}`, {
      method: 'GET',
    });
    return response;
  },

  async getPaymentGroup(id: number): Promise<PaymentGroup> {
    const response = await createApiCall<PaymentGroup>(
      `${BASE_URL}/groups/${id}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async getPaymentGroupByQuotation(
    quotationId: number
  ): Promise<PaymentGroup | null> {
    const response = await createApiCall<PaymentGroup | null>(
      `${BASE_URL}/groups/quotation/${quotationId}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  async updatePaymentGroup(
    id: number,
    data: Partial<PaymentGroup>
  ): Promise<PaymentGroup> {
    const response = await createApiCall<PaymentGroup>(
      `${BASE_URL}/groups/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response;
  },

  async approvePaymentGroup(id: number): Promise<PaymentGroup> {
    const response = await createApiCall<PaymentGroup>(
      `${BASE_URL}/groups/${id}/approve`,
      {
        method: 'POST',
      }
    );
    return response;
  },

  async rejectPaymentGroup(id: number, reason: string): Promise<PaymentGroup> {
    const response = await createApiCall<PaymentGroup>(
      `${BASE_URL}/groups/${id}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
    return response;
  },

  // Payment Detail endpoints
  async createPaymentDetail(
    data: CreatePaymentDetailDto
  ): Promise<PaymentDetail> {
    const response = await createApiCall<PaymentDetail>(`${BASE_URL}/details`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  async updatePaymentDetailReceipt(
    id: number,
    data: {
      paymentReceipt?: string;
      depositDate?: string;
      movementNumber?: string;
      description?: string;
    },
    file?: File
  ): Promise<PaymentDetail> {
    const formData = new FormData();

    // Add form data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    // Add file if provided - backend expects 'receiptImage'
    if (file) {
      formData.append('receiptImage', file);
    }

    const response = await createApiCall<PaymentDetail>(
      `${BASE_URL}/details/${id}/receipt`,
      {
        method: 'PUT',
        body: formData,
      },
      false,
      true
    );
    return response;
  },

  async updatePaymentDetailInvoice(
    id: number,
    data: {
      purchaseDate?: string;
      invoiceEmissionDate?: string;
      documentNumber?: string;
      description?: string;
    },
    file?: File
  ): Promise<PaymentDetail> {
    const formData = new FormData();

    // Add form data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    // Add file if provided - backend expects 'invoiceImage'
    if (file) {
      formData.append('invoiceImage', file);
    }

    const response = await createApiCall<PaymentDetail>(
      `${BASE_URL}/details/${id}/invoice`,
      {
        method: 'PUT',
        body: formData,
      },
      false,
      true
    );
    return response;
  },

  async getPaymentDetail(id: number): Promise<PaymentDetail> {
    const response = await createApiCall<PaymentDetail>(
      `${BASE_URL}/details/${id}`,
      {
        method: 'GET',
      }
    );
    return response;
  },

  // Statistics
  async getPaymentStatistics(
    type: 'ARTICLE' | 'SERVICE'
  ): Promise<PaymentStatistics> {
    const response = await createApiCall<PaymentStatistics>(
      `${BASE_URL}/groups/statistics?type=${type}`,
      {
        method: 'GET',
      }
    );
    return response;
  },
};

export default paymentService;
