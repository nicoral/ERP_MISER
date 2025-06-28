import React, { useState, useEffect } from 'react';
import {
  QuotationStep,
  type QuotationRequest as QuotationRequestType,
  type SelectedSupplier,
  type CreateQuotationRequestDto,
  type SupplierQuotationItem,
} from '../../../types/quotation';
import { useQuotationService } from '../../../hooks/useQuotationService';
import { useToast } from '../../../contexts/ToastContext';
import type { Requirement } from '../../../types/requirement';
import { getCurrentStepFromQuotation } from '../../../utils/quotationUtils';
import { RequirementSelection } from './steps/RequirementSelection';
import { SupplierSelection } from './steps/SupplierSelection';
import { GenerateOrders } from './steps/GenerateOrders';
import { ReceiveQuotations } from './steps/ReceiveQuotations';
import { CompareQuotations } from './steps/CompareQuotations';
import { FinalSelection } from './steps/FinalSelection';

interface QuotationWizardProps {
  requirement?: Requirement;
  existingQuotation?: QuotationRequestType;
  onComplete?: (quotationRequest: QuotationRequestType) => void;
  onCancel?: () => void;
}

const stepTitles = [
  'Selección de Requerimiento',
  'Selección de Proveedores',
  'Generación de Órdenes',
  'Ingreso de Cotizaciones',
  'Comparación de Precios',
  'Selección Final',
];

const stepDescriptions = [
  'Selecciona el requerimiento aprobado para iniciar el proceso de cotización',
  'Selecciona los proveedores que recibirán la solicitud de cotización',
  'Genera y envía las órdenes de cotización a los proveedores seleccionados',
  'Ingresa las cotizaciones recibidas de cada proveedor',
  'Compara precios y términos entre proveedores',
  'Selecciona los proveedores finales y genera la orden de compra',
];

export const QuotationWizard: React.FC<QuotationWizardProps> = ({
  requirement: initialRequirement,
  existingQuotation,
  onComplete,
  onCancel,
}) => {
  const { showSuccess, showError } = useToast();
  const {
    createQuotationRequest,
    loading,
    error,
    updateQuotationRequest,
    getQuotationByRequirement,
  } = useQuotationService();

  const [currentStep, setCurrentStep] = useState<QuotationStep>(
    existingQuotation
      ? getCurrentStepFromQuotation(existingQuotation)
      : initialRequirement
        ? QuotationStep.SUPPLIER_SELECTION
        : QuotationStep.REQUIREMENT_SELECTION
  );
  const [requirement, setRequirement] = useState<Requirement | null>(
    existingQuotation?.requirement || initialRequirement || null
  );
  const [selectedSuppliers, setSelectedSuppliers] = useState<
    SelectedSupplier[]
  >(
    existingQuotation?.quotationSuppliers
      .filter(qs => qs.supplier) // Filtrar proveedores válidos
      .map(qs => ({
        supplier: qs.supplier,
        isSelected: true,
      })) || []
  );
  const [quotationRequest, setQuotationRequest] =
    useState<QuotationRequestType | null>(existingQuotation || null);

  // Efecto para inicializar la cotización existente
  useEffect(() => {
    if (existingQuotation) {
      console.log(
        'QuotationWizard - Cotización existente recibida:',
        existingQuotation
      );
      setQuotationRequest(existingQuotation);
      setRequirement(existingQuotation.requirement);
      setCurrentStep(getCurrentStepFromQuotation(existingQuotation));

      // Cargar los proveedores seleccionados con sus cotizaciones recibidas
      if (existingQuotation.quotationSuppliers.length > 0) {
        const suppliers: SelectedSupplier[] =
          existingQuotation.quotationSuppliers
            .filter(qs => qs.supplier)
            .map(qs => {
              const selectedSupplier: SelectedSupplier = {
                supplier: qs.supplier,
                isSelected: true,
              };

              // Incluir cotización recibida si existe
              if (qs.supplierQuotation) {
                selectedSupplier.receivedQuotation = {
                  id: qs.supplierQuotation.id,
                  supplierId: qs.supplier.id,
                  requirementId: existingQuotation.requirement.id,
                  receivedAt: new Date(qs.supplierQuotation.receivedAt),
                  validUntil: new Date(qs.supplierQuotation.validUntil),
                  items: qs.supplierQuotation.supplierQuotationItems.map(
                    (item: SupplierQuotationItem) => ({
                      id: item.id,
                      requirementArticleId: item.requirementArticle.id,
                      article: item.requirementArticle.article,
                      quantity: item.requirementArticle.quantity,
                      unitPrice: item.unitPrice || 0,
                      totalPrice: item.totalPrice || 0,
                      currency: item.currency || 'PEN',
                      deliveryTime: item.deliveryTime || 0,
                      notes: item.notes || '',
                      status: item.status,
                      reasonNotAvailable: item.reasonNotAvailable || '',
                    })
                  ),
                  totalAmount: qs.supplierQuotation.totalAmount,
                  status:
                    qs.supplierQuotation.status === 'SUBMITTED'
                      ? 'SUBMITTED'
                      : 'DRAFT',
                  notes: qs.supplierQuotation.notes || '',
                };
              }

              // Incluir orden de cotización si existe
              if (qs.orderNumber || qs.terms) {
                selectedSupplier.quotationOrder = {
                  id: qs.id,
                  supplierId: qs.supplier.id,
                  requirementId: existingQuotation.requirement.id,
                  orderNumber: qs.orderNumber || '',
                  terms: qs.terms || '',
                  deadline: qs.sentAt ? new Date(qs.sentAt) : new Date(),
                  status: qs.status,
                  createdAt: new Date(qs.createdAt),
                  updatedAt: new Date(qs.updatedAt),
                };
              }

              return selectedSupplier;
            });
        console.log(
          'QuotationWizard - Proveedores cargados con cotizaciones:',
          suppliers
        );
        setSelectedSuppliers(suppliers);
      }

      showSuccess(
        'Cotización cargada',
        `Continuando con la cotización ${existingQuotation.code} donde se quedó`
      );
    }
  }, [existingQuotation, showSuccess]);

  const handleRequirementSelected = async (
    selectedRequirement: Requirement
  ) => {
    setRequirement(selectedRequirement);

    // Verificar si ya existe una cotización para este requerimiento
    const existingQuotation = await getQuotationByRequirement(
      selectedRequirement.id
    );

    // Si no existe cotización, crear una nueva
    if (!existingQuotation) {
      const createData: CreateQuotationRequestDto = {
        requirementId: selectedRequirement.id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días por defecto
        notes: '',
      };

      const createdQuotation = await createQuotationRequest(createData);
      if (createdQuotation) {
        setQuotationRequest(createdQuotation);
        setCurrentStep(QuotationStep.SUPPLIER_SELECTION);
        showSuccess(
          'Cotización creada',
          `Cotización ${createdQuotation.code} creada exitosamente`
        );
      } else {
        showError(
          'Error al crear cotización',
          error || 'No se pudo crear la cotización. Inténtalo de nuevo.'
        );
      }
    } else {
      // Si existe, cargar la cotización existente y continuar donde se quedó
      setQuotationRequest(existingQuotation);
      const currentStepFromQuotation =
        getCurrentStepFromQuotation(existingQuotation);
      setCurrentStep(currentStepFromQuotation);

      // Cargar los proveedores seleccionados si existen
      if (existingQuotation.quotationSuppliers.length > 0) {
        const suppliers: SelectedSupplier[] =
          existingQuotation.quotationSuppliers
            .filter(qs => qs.supplier)
            .map(qs => {
              const selectedSupplier: SelectedSupplier = {
                supplier: qs.supplier,
                isSelected: true,
              };

              // Incluir cotización recibida si existe
              if (qs.supplierQuotation) {
                selectedSupplier.receivedQuotation = {
                  id: qs.supplierQuotation.id,
                  supplierId: qs.supplier.id,
                  requirementId: existingQuotation.requirement.id,
                  receivedAt: new Date(qs.supplierQuotation.receivedAt),
                  validUntil: new Date(qs.supplierQuotation.validUntil),
                  items: qs.supplierQuotation.supplierQuotationItems.map(
                    (item: SupplierQuotationItem) => ({
                      id: item.id,
                      requirementArticleId: item.requirementArticle.id,
                      article: item.requirementArticle.article,
                      quantity: item.requirementArticle.quantity,
                      unitPrice: item.unitPrice || 0,
                      totalPrice: item.totalPrice || 0,
                      currency: item.currency || 'PEN',
                      deliveryTime: item.deliveryTime || 0,
                      notes: item.notes || '',
                      status: item.status,
                      reasonNotAvailable: item.reasonNotAvailable || '',
                    })
                  ),
                  totalAmount: qs.supplierQuotation.totalAmount,
                  status:
                    qs.supplierQuotation.status === 'SUBMITTED'
                      ? 'SUBMITTED'
                      : 'DRAFT',
                  notes: qs.supplierQuotation.notes || '',
                };
              }

              // Incluir orden de cotización si existe
              if (qs.orderNumber || qs.terms) {
                selectedSupplier.quotationOrder = {
                  id: qs.id,
                  supplierId: qs.supplier.id,
                  requirementId: existingQuotation.requirement.id,
                  orderNumber: qs.orderNumber || '',
                  terms: qs.terms || '',
                  deadline: qs.sentAt ? new Date(qs.sentAt) : new Date(),
                  status: qs.status,
                  createdAt: new Date(qs.createdAt),
                  updatedAt: new Date(qs.updatedAt),
                };
              }

              return selectedSupplier;
            });
        setSelectedSuppliers(suppliers);
      }

      showSuccess(
        'Cotización existente encontrada',
        `Continuando con la cotización ${existingQuotation.code} donde se quedó`
      );
    }
  };

  const handleStepComplete = async (
    stepData: Partial<QuotationRequestType> | SelectedSupplier[]
  ) => {
    if (Array.isArray(stepData)) {
      // Es un array de SelectedSupplier - Paso 2: Selección de Proveedores
      setSelectedSuppliers(stepData);

      // Solo actualizar en el backend si hay cambios reales
      if (quotationRequest) {
        const currentSupplierIds = new Set(
          (quotationRequest.quotationSuppliers || [])
            .filter(qs => qs.supplier) // Filtrar proveedores válidos
            .map(qs => qs.supplier.id)
        );
        const newSupplierIds = new Set(
          stepData
            .filter(s => s.supplier) // Filtrar proveedores válidos
            .map(s => s.supplier.id)
        );
        const hasChanges =
          currentSupplierIds.size !== newSupplierIds.size ||
          Array.from(currentSupplierIds).some(id => !newSupplierIds.has(id)) ||
          Array.from(newSupplierIds).some(id => !currentSupplierIds.has(id));

        if (hasChanges) {
          const updateData = {
            suppliers: stepData
              .filter(s => s.supplier) // Filtrar proveedores válidos
              .map(s => ({ supplierId: s.supplier.id })),
          };

          const updatedQuotation = await updateQuotationRequest(
            quotationRequest.id,
            updateData
          );
          if (updatedQuotation) {
            setQuotationRequest(updatedQuotation);
            showSuccess(
              'Proveedores actualizados',
              `${stepData.length} proveedores agregados a la cotización`
            );
          } else {
            showError(
              'Error al actualizar proveedores',
              error ||
                'No se pudieron actualizar los proveedores. Inténtalo de nuevo.'
            );
            return; // No continuar si hay error
          }
        }
      }
    } else {
      // Es un objeto de QuotationRequest
      if (quotationRequest) {
        const updatedRequest = {
          ...quotationRequest,
          ...stepData,
          updatedAt: new Date(),
        };
        setQuotationRequest(updatedRequest);
      }
    }

    if (currentStep === QuotationStep.FINAL_SELECTION) {
      handleCreateQuotation();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCreateQuotation = async () => {
    if (!quotationRequest) return;
    onComplete?.(quotationRequest);
    showSuccess(
      'Proceso completado',
      'El proceso de cotización se ha completado exitosamente'
    );
  };

  const handleStepBack = () => {
    if (currentStep > QuotationStep.REQUIREMENT_SELECTION) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    // Si estamos editando una cotización existente, no necesitamos verificar el requerimiento
    if (
      !requirement &&
      currentStep !== QuotationStep.REQUIREMENT_SELECTION &&
      !existingQuotation
    ) {
      return (
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Primero debes seleccionar un requerimiento
            </p>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case QuotationStep.REQUIREMENT_SELECTION:
        return (
          <RequirementSelection
            onRequirementSelected={handleRequirementSelected}
            onBack={onCancel}
            isCreatingQuotation={loading}
          />
        );

      case QuotationStep.SUPPLIER_SELECTION:
        return (
          <SupplierSelection
            selectedSuppliers={selectedSuppliers}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
          />
        );

      case QuotationStep.GENERATE_ORDERS:
        return (
          <GenerateOrders
            requirement={requirement!}
            selectedSuppliers={selectedSuppliers}
            quotationRequestId={quotationRequest?.id || 0}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
          />
        );

      case QuotationStep.RECEIVE_QUOTATIONS:
        return (
          <ReceiveQuotations
            requirement={requirement!}
            selectedSuppliers={selectedSuppliers}
            quotationRequestId={quotationRequest?.id || 0}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
          />
        );

      case QuotationStep.COMPARE_QUOTATIONS:
        return (
          <CompareQuotations
            requirement={requirement!}
            selectedSuppliers={selectedSuppliers}
            quotationRequestId={quotationRequest?.id || 0}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
          />
        );

      case QuotationStep.FINAL_SELECTION:
        return (
          <FinalSelection
            requirement={requirement!}
            selectedSuppliers={selectedSuppliers}
            quotationRequestId={quotationRequest?.id || 0}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="mt-2 text-xs text-center max-w-24">
                    <div
                      className={`font-medium ${
                        index <= currentStep
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {title}
                    </div>
                  </div>
                </div>
                {index < stepTitles.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      index < currentStep
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Description */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {stepTitles[currentStep]}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {stepDescriptions[currentStep]}
          </p>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {renderStepContent()}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Creando cotización...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
