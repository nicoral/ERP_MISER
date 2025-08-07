import { useState, useCallback } from 'react';
import paymentService from '../services/api/paymentService';
import type {
  PaymentGroup,
  PaymentGroupFilters,
  CreatePaymentDetailDto,
  CreatePaymentInvoiceDto,
  UpdatePaymentInvoiceDto,
} from '../types/payment';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const usePaymentService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  const getPaymentDetail = useCallback(
    async (id: number) => {
      return handleRequest(() => paymentService.getPaymentDetail(id));
    },
    [handleRequest]
  );

  // Payment Invoice methods
  const createPaymentInvoice = useCallback(
    async (data: CreatePaymentInvoiceDto, file?: File) => {
      return handleRequest(() =>
        paymentService.createPaymentInvoice(data, file)
      );
    },
    [handleRequest]
  );

  const updatePaymentInvoice = useCallback(
    async (id: number, data: UpdatePaymentInvoiceDto, file?: File) => {
      return handleRequest(() =>
        paymentService.updatePaymentInvoice(id, data, file)
      );
    },
    [handleRequest]
  );

  const getPaymentInvoice = useCallback(
    async (id: number) => {
      return handleRequest(() => paymentService.getPaymentInvoice(id));
    },
    [handleRequest]
  );

  const getInvoicesByPaymentDetail = useCallback(
    async (paymentDetailId: number) => {
      return handleRequest(() =>
        paymentService.getInvoicesByPaymentDetail(paymentDetailId)
      );
    },
    [handleRequest]
  );

  const getInvoicesStatistics = useCallback(
    async (paymentDetailId: number) => {
      return handleRequest(() =>
        paymentService.getInvoicesStatistics(paymentDetailId)
      );
    },
    [handleRequest]
  );

  const deletePaymentInvoice = useCallback(
    async (id: number) => {
      return handleRequest(() => paymentService.deletePaymentInvoice(id));
    },
    [handleRequest]
  );

  // Statistics
  const getPaymentStatistics = useCallback(
    async (type: 'ARTICLE' | 'SERVICE') => {
      return handleRequest(() => paymentService.getPaymentStatistics(type));
    },
    [handleRequest]
  );

  const cancelPaymentGroup = useMutation({
    mutationFn: (id: number) => paymentService.cancelPaymentGroup(id),
    onSuccess: () => {
      // Invalidate and refetch payment data
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    // Payment Groups
    getPaymentGroups,
    getPaymentGroup,
    getPaymentGroupByQuotation,
    updatePaymentGroup,
    approvePaymentGroup,
    rejectPaymentGroup,
    cancelPaymentGroup: cancelPaymentGroup.mutateAsync,
    isCancelling: cancelPaymentGroup.isPending,

    // Payment Details
    createPaymentDetail,
    updatePaymentDetailReceipt,
    getPaymentDetail,

    // Payment Invoice
    createPaymentInvoice,
    updatePaymentInvoice,
    getPaymentInvoice,
    getInvoicesByPaymentDetail,
    getInvoicesStatistics,
    deletePaymentInvoice,

    // Statistics
    getPaymentStatistics,
  };
};
