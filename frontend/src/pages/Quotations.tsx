import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuotationWizard } from '../features/quotation/components/QuotationWizard';
import { QuotationList } from '../features/quotation/components/QuotationList';
import { type QuotationRequest } from '../types/quotation';
import { useQuotationService } from '../hooks/useQuotationService';
import { useToast } from '../contexts/ToastContext';
import { ROUTES } from '../config/constants';

export const Quotations: React.FC = () => {
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const [selectedQuotation, setSelectedQuotation] =
    useState<QuotationRequest | null>(null);
  const [editingQuotation, setEditingQuotation] =
    useState<QuotationRequest | null>(null);

  const { getQuotationRequest } = useQuotationService();
  const { showError } = useToast();

  const handleStartQuotation = () => {
    setShowWizard(true);
    setEditingQuotation(null);
  };

  const handleWizardComplete = (quotationRequest: QuotationRequest) => {
    setSelectedQuotation(quotationRequest);
    setShowWizard(false);
    setEditingQuotation(null);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setEditingQuotation(null);
  };

  const handleViewQuotation = (quotation: QuotationRequest) => {
    navigate(ROUTES.QUOTATION_DETAILS.replace(':id', quotation.id.toString()));
  };

  const handleEditQuotation = async (quotation: QuotationRequest) => {
    try {
      // Cargar la cotización completa con todas las relaciones
      const fullQuotation = await getQuotationRequest(quotation.id);
      console.log('Cotización completa cargada:', fullQuotation);
      if (fullQuotation) {
        setEditingQuotation(fullQuotation);
        setShowWizard(true);
      } else {
        showError('Error', 'No se pudo cargar la cotización completa');
      }
    } catch {
      showError('Error', 'No se pudo cargar la cotización completa');
    }
  };

  const handleCreateQuotation = () => {
    setSelectedQuotation(null);
    setEditingQuotation(null);
    handleStartQuotation();
  };

  if (showWizard) {
    return (
      <QuotationWizard
        existingQuotation={editingQuotation || undefined}
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QuotationList
          onViewQuotation={handleViewQuotation}
          onEditQuotation={handleEditQuotation}
          onCreateQuotation={handleCreateQuotation}
        />
      </div>

      {/* Success Message */}
      {selectedQuotation && (
        <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Cotización completada exitosamente
              </p>
              <p className="text-sm text-green-600 dark:text-green-300">
                {selectedQuotation.code}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSelectedQuotation(null)}
                className="inline-flex text-green-400 hover:text-green-500"
              >
                <span className="sr-only">Cerrar</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
