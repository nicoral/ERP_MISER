import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import purchaseOrderService from '../services/api/purchaseOrderService';
import type { PurchaseOrder } from '../types/purchaseOrder';

export const usePurchaseOrders = (
  page: number,
  limit: number,
  type: 'ARTICLE' | 'SERVICE'
) => {
  return useQuery({
    queryKey: ['purchase-orders', page, limit, type],
    queryFn: () => purchaseOrderService.getAllPurchaseOrders(page, limit, type),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: false,
  });
};

export const usePurchaseOrdersWithoutExitPart = (
  type: 'article' | 'service'
) => {
  return useQuery({
    queryKey: ['purchase-orders-without-exit-part', type],
    queryFn: () => purchaseOrderService.getPurchaseOrderWithoutExitPart(type),
  });
};

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

export const usePurchaseOrderByIdQuery = (id: number) => {
  return useQuery<PurchaseOrder | undefined>({
    queryKey: ['purchaseOrder', id],
    queryFn: () => purchaseOrderService.getById(id),
    enabled: !!id,
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

/**
 * Hook para obtener la configuración de firmas de una orden de compra
 */
export const usePurchaseOrderSignatureConfiguration = (
  id: number | undefined
) => {
  return useQuery({
    queryKey: ['purchase-order-signature-configuration', id],
    queryFn: () => purchaseOrderService.getSignatureConfiguration(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
