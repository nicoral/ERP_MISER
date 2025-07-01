import { useState, useCallback } from 'react';
import quotationService from '../services/api/quotationService';
import type {
  QuotationRequest,
  CreateQuotationRequestDto,
  UpdateQuotationRequestDto,
  CreateSupplierQuotationDto,
  UpdateSupplierQuotationDto,
  CreateFinalSelectionDto,
  UpdateFinalSelectionDto,
  UpdateQuotationBasicDto,
  UpdateQuotationOrderDto,
  SendQuotationOrderDto,
  ApplyGeneralTermsDto,
  QuotationFilters,
} from '../types/quotation';

export const useQuotationService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotationByRequirement, setQuotationByRequirement] =
    useState<QuotationRequest | null>(null);

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

  // QuotationRequest methods
  const createQuotationRequest = useCallback(
    async (data: CreateQuotationRequestDto) => {
      return handleRequest(() => quotationService.createQuotationRequest(data));
    },
    [handleRequest]
  );

  const getQuotationRequests = useCallback(
    async (page: number, limit: number, filters?: QuotationFilters) => {
      return handleRequest(() =>
        quotationService.getQuotationRequests(page, limit, filters)
      );
    },
    [handleRequest]
  );

  const getQuotationRequest = useCallback(
    async (id: number) => {
      return handleRequest(() => quotationService.getQuotationRequest(id));
    },
    [handleRequest]
  );

  const getQuotationByRequirement = useCallback(
    async (requirementId: number) => {
      const result = await handleRequest(() =>
        quotationService.getQuotationByRequirement(requirementId)
      );
      setQuotationByRequirement(result);
      return result;
    },
    [handleRequest]
  );

  const updateQuotationRequest = useCallback(
    async (id: number, data: UpdateQuotationRequestDto) => {
      return handleRequest(() =>
        quotationService.updateQuotationRequest(id, data)
      );
    },
    [handleRequest]
  );

  const deleteQuotationRequest = useCallback(
    async (id: number) => {
      return handleRequest(() => quotationService.deleteQuotationRequest(id));
    },
    [handleRequest]
  );

  const updateQuotationBasic = useCallback(
    async (id: number, data: UpdateQuotationBasicDto) => {
      return handleRequest(() =>
        quotationService.updateQuotationBasic(id, data)
      );
    },
    [handleRequest]
  );

  // Supplier Quotation methods
  const createSupplierQuotation = useCallback(
    async (data: CreateSupplierQuotationDto) => {
      return handleRequest(() =>
        quotationService.createSupplierQuotation(data)
      );
    },
    [handleRequest]
  );

  const getSupplierQuotation = useCallback(
    async (id: number) => {
      return handleRequest(() => quotationService.getSupplierQuotation(id));
    },
    [handleRequest]
  );

  const getSupplierQuotationsByRequest = useCallback(
    async (quotationRequestId: number) => {
      return handleRequest(() =>
        quotationService.getSupplierQuotationsByRequest(quotationRequestId)
      );
    },
    [handleRequest]
  );

  const updateSupplierQuotation = useCallback(
    async (id: number, data: UpdateSupplierQuotationDto) => {
      return handleRequest(() =>
        quotationService.updateSupplierQuotation(id, data)
      );
    },
    [handleRequest]
  );

  const submitSupplierQuotation = useCallback(
    async (id: number) => {
      return handleRequest(() => quotationService.submitSupplierQuotation(id));
    },
    [handleRequest]
  );

  // Final Selection methods
  const createFinalSelection = useCallback(
    async (data: CreateFinalSelectionDto) => {
      return handleRequest(() => quotationService.createFinalSelection(data));
    },
    [handleRequest]
  );

  const getFinalSelection = useCallback(
    async (id: number) => {
      return handleRequest(() => quotationService.getFinalSelection(id));
    },
    [handleRequest]
  );

  const getFinalSelectionByRequest = useCallback(
    async (quotationRequestId: number) => {
      return handleRequest(() =>
        quotationService.getFinalSelectionByRequest(quotationRequestId)
      );
    },
    [handleRequest]
  );

  const updateFinalSelection = useCallback(
    async (id: number, data: UpdateFinalSelectionDto) => {
      return handleRequest(() =>
        quotationService.updateFinalSelection(id, data)
      );
    },
    [handleRequest]
  );

  const approveFinalSelection = useCallback(
    async (id: number) => {
      return handleRequest(() => quotationService.approveFinalSelection(id));
    },
    [handleRequest]
  );

  // Quotation Order methods
  const updateQuotationOrder = useCallback(
    async (quotationRequestId: number, data: UpdateQuotationOrderDto) => {
      return handleRequest(() =>
        quotationService.updateQuotationOrder(quotationRequestId, data)
      );
    },
    [handleRequest]
  );

  const sendQuotationOrder = useCallback(
    async (quotationRequestId: number, data: SendQuotationOrderDto) => {
      return handleRequest(() =>
        quotationService.sendQuotationOrder(quotationRequestId, data)
      );
    },
    [handleRequest]
  );

  const sendAllQuotationOrders = useCallback(
    async (quotationRequestId: number) => {
      return handleRequest(() =>
        quotationService.sendAllQuotationOrders(quotationRequestId)
      );
    },
    [handleRequest]
  );

  const applyGeneralTermsToAll = useCallback(
    async (quotationRequestId: number, data: ApplyGeneralTermsDto) => {
      return handleRequest(() =>
        quotationService.applyGeneralTermsToAll(quotationRequestId, data)
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
    quotationByRequirement,
    // QuotationRequest
    createQuotationRequest,
    getQuotationRequests,
    getQuotationRequest,
    getQuotationByRequirement,
    updateQuotationRequest,
    deleteQuotationRequest,
    updateQuotationBasic,
    // Supplier Quotation
    createSupplierQuotation,
    getSupplierQuotation,
    getSupplierQuotationsByRequest,
    updateSupplierQuotation,
    submitSupplierQuotation,
    // Final Selection
    createFinalSelection,
    getFinalSelection,
    getFinalSelectionByRequest,
    updateFinalSelection,
    approveFinalSelection,
    // Quotation Orders
    updateQuotationOrder,
    sendQuotationOrder,
    sendAllQuotationOrders,
    applyGeneralTermsToAll,
  };
};
