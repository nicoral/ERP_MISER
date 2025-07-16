import { useState, useCallback } from 'react';
import paymentService from '../services/api/paymentService';
import type {
  PaymentGroup,
  PaymentGroupFilters,
  CreatePaymentDetailDto,
} from '../types/payment';

export const usePaymentService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(
    async <T>(requestFn: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await requestFn();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Payment Group methods
  const getPaymentGroups = useCallback(
    async (
      type: 'ARTICLE' | 'SERVICE',
      page: number,
      limit: number,
      filters?: PaymentGroupFilters
    ) => {
      return handleRequest(() =>
        paymentService.getPaymentGroups(type, page, limit, filters)
      );
    },
    [handleRequest]
  );

  const getPaymentGroup = useCallback(
    async (id: number) => {
      return handleRequest(() => paymentService.getPaymentGroup(id));
    },
    [handleRequest]
  );

  const getPaymentGroupByQuotation = useCallback(
    async (quotationId: number) => {
      return handleRequest(() =>
        paymentService.getPaymentGroupByQuotation(quotationId)
      );
    },
    [handleRequest]
  );

  const updatePaymentGroup = useCallback(
    async (id: number, data: Partial<PaymentGroup>) => {
      return handleRequest(() => paymentService.updatePaymentGroup(id, data));
    },
    [handleRequest]
  );

  const approvePaymentGroup = useCallback(
    async (id: number) => {
      return handleRequest(() => paymentService.approvePaymentGroup(id));
    },
    [handleRequest]
  );

  const rejectPaymentGroup = useCallback(
    async (id: number, reason: string) => {
      return handleRequest(() => paymentService.rejectPaymentGroup(id, reason));
    },
    [handleRequest]
  );

  // Payment Detail methods
  const createPaymentDetail = useCallback(
    async (data: CreatePaymentDetailDto) => {
      return handleRequest(() => paymentService.createPaymentDetail(data));
    },
    [handleRequest]
  );

  const updatePaymentDetailReceipt = useCallback(
    async (
      id: number,
      data: {
        paymentReceipt?: string;
        depositDate?: string;
        movementNumber?: string;
        description?: string;
      },
      file?: File
    ) => {
      return handleRequest(() =>
        paymentService.updatePaymentDetailReceipt(id, data, file)
      );
    },
    [handleRequest]
  );

  const updatePaymentDetailInvoice = useCallback(
    async (
      id: number,
      data: {
        purchaseDate?: string;
        invoiceEmissionDate?: string;
        documentNumber?: string;
        description?: string;
      },
      file?: File
    ) => {
      return handleRequest(() =>
        paymentService.updatePaymentDetailInvoice(id, data, file)
      );
    },
    [handleRequest]
  );

  const getPaymentDetail = useCallback(
    async (id: number) => {
      return handleRequest(() => paymentService.getPaymentDetail(id));
    },
    [handleRequest]
  );

  // Statistics
  const getPaymentStatistics = useCallback(async () => {
    return handleRequest(() => paymentService.getPaymentStatistics());
  }, [handleRequest]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    // Payment Group
    getPaymentGroups,
    getPaymentGroup,
    getPaymentGroupByQuotation,
    updatePaymentGroup,
    approvePaymentGroup,
    rejectPaymentGroup,
    // Payment Detail
    createPaymentDetail,
    updatePaymentDetailReceipt,
    updatePaymentDetailInvoice,
    getPaymentDetail,
    // Statistics
    getPaymentStatistics,
  };
};
