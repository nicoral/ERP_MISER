import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import purchaseOrderService from '../services/api/purchaseOrderService';
import type { PurchaseOrder } from '../types/purchaseOrder';

export const usePurchaseOrderQuery = (
  quotationId?: number,
  supplierId?: number
) => {
  return useQuery<PurchaseOrder | undefined>({
    queryKey: ['purchaseOrder', quotationId, supplierId],
    queryFn: () => {
      if (!quotationId || !supplierId) return undefined;
      return purchaseOrderService.getByQuotationAndSupplier(
        quotationId,
        supplierId
      );
    },
    enabled: !!quotationId && !!supplierId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: false,
  });
};

export const usePurchaseOrderService = () => {
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
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getByQuotationAndSupplier = useCallback(
    async (quotationRequestId: number, supplierId: number) => {
      return handleRequest(() =>
        purchaseOrderService.getByQuotationAndSupplier(
          quotationRequestId,
          supplierId
        )
      );
    },
    [handleRequest]
  );

  const getQuotationSummary = useCallback(
    async (quotationRequestId: number) => {
      return handleRequest(() =>
        purchaseOrderService.getQuotationSummary(quotationRequestId)
      );
    },
    [handleRequest]
  );

  const getByRequirement = useCallback(
    async (requirementId: number) => {
      return handleRequest(() =>
        purchaseOrderService.getByRequirement(requirementId)
      );
    },
    [handleRequest]
  );

  const updatePurchaseOrder = useCallback(
    async (
      id: number,
      data: { igv?: number; paymentMethod?: string; observation?: string }
    ) => {
      return handleRequest(() =>
        purchaseOrderService.updatePurchaseOrder(id, data)
      );
    },
    [handleRequest]
  );

  const downloadPurchaseOrderPdf = useCallback(
    async (id: number) => {
      return handleRequest(() =>
        purchaseOrderService.downloadPurchaseOrderPdf(id)
      );
    },
    [handleRequest]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    getByQuotationAndSupplier,
    getQuotationSummary,
    getByRequirement,
    updatePurchaseOrder,
    downloadPurchaseOrderPdf,
  };
};
