import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuotationWizard } from '../features/quotation/components/QuotationWizard';
import { useQuotationService } from '../hooks/useQuotationService';
import { useToast } from '../contexts/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ROUTES } from '../config/constants';
import type { QuotationRequest } from '../types/quotation';

export const QuotationEdit: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { getQuotationRequest, loading, error } = useQuotationService();
  const { showError } = useToast();

  const [quotation, setQuotation] = useState<QuotationRequest | null>(null);

  useEffect(() => {
    const loadQuotation = async () => {
      if (params.id) {
        const result = await getQuotationRequest(Number(params.id));
        if (result) {
          setQuotation(result);
        } else {
          showError('Error', 'No se pudo cargar la cotización');
          navigate(
            quotation?.requirement.type === 'ARTICLE'
              ? ROUTES.QUOTATIONS_ARTICLES
              : ROUTES.QUOTATIONS_SERVICES
          );
        }
      }
    };
    loadQuotation();
  }, [params.id, getQuotationRequest, showError, navigate]);

  const handleWizardComplete = (quotationRequest: QuotationRequest) => {
    // Redirigir a los detalles de la cotización
    navigate(
      ROUTES.QUOTATION_DETAILS.replace(':id', quotationRequest.id.toString())
    );
  };

  const handleWizardCancel = () => {
    // Redirigir de vuelta a la lista de cotizaciones
    navigate(
      quotation?.requirement.type === 'ARTICLE'
        ? ROUTES.QUOTATIONS_ARTICLES
        : ROUTES.QUOTATIONS_SERVICES
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!quotation)
    return <div className="text-red-500">Cotización no encontrada</div>;

  return (
    <QuotationWizard
      existingQuotation={quotation}
      onComplete={handleWizardComplete}
      onCancel={handleWizardCancel}
    />
  );
};
