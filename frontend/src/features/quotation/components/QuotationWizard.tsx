import React, { useState, useEffect } from 'react';
import {
  QuotationStep,
  type QuotationRequest as QuotationRequestType,
  type SelectedSupplier,
  type SupplierQuotationItem,
  QuotationItemStatus,
} from '../../../types/quotation';
import { useQuotationService } from '../../../hooks/useQuotationService';
import { useToast } from '../../../contexts/ToastContext';
import type { Requirement } from '../../../types/requirement';
import { getCurrentStepFromQuotation } from '../../../utils/quotationUtils';
// RequirementSelection se mantiene importado por compatibilidad pero no se usa en el nuevo flujo
import { SupplierSelection } from './steps/SupplierSelection';
import { GenerateOrders } from './steps/GenerateOrders';
import { ReceiveQuotations } from './steps/ReceiveQuotations';
import { CompareQuotations } from './steps/CompareQuotations';
import { FinalSelection } from './steps/FinalSelection';
import { Button } from '../../../components/common/Button';

interface QuotationWizardProps {
  requirement?: Requirement;
  existingQuotation?: QuotationRequestType;
  onComplete?: (quotationRequest: QuotationRequestType) => void;
  onCancel?: () => void;
}

const stepTitles = [
  'Selección de Proveedores',
  'Solicitudes de cotización',
  'Ingreso de Cotizaciones',
  'Comparación de Precios',
  'Selección Final',
];

const stepDescriptions = [
  'Selecciona los proveedores que recibirán la solicitud de cotización',
  'Genera y envía las órdenes de cotización a los proveedores seleccionados',
  'Ingresa las cotizaciones recibidas de cada proveedor',
  'Compara precios y selecciona los proveedores finales',
  'Revisa y confirma los proveedores seleccionados',
];

export const QuotationWizard: React.FC<QuotationWizardProps> = ({
  requirement: initialRequirement,
  existingQuotation,
  onComplete,
  onCancel,
}) => {
  const { showSuccess, showError } = useToast();
  const { loading, error, updateQuotationRequest, getQuotationByRequirement } =
    useQuotationService();
  const [showExitModal, setShowExitModal] = useState(false);

  const [currentStep, setCurrentStep] = useState<QuotationStep>(
    existingQuotation
      ? getCurrentStepFromQuotation(existingQuotation)
      : QuotationStep.SUPPLIER_SELECTION
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
                  serviceItems:
                    qs.supplierQuotation.supplierQuotationServiceItems
                      .filter(item => item.requirementService)
                      .map(item => ({
                        id: item.id,
                        serviceId: item.requirementService!.id,
                        service: item.requirementService!.service,
                        unitPrice: item.unitPrice || 0,
                        currency: item.currency || 'PEN',
                        deliveryTime: item.deliveryTime || 0,
                        duration: item.duration || 0,
                        durationType: item.durationType || 'DIA',
                        notes: item.notes || '',
                        status: item.status,
                        reasonNotAvailable: item.reasonNotAvailable || '',
                      })),
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
    }
  }, [existingQuotation, showSuccess]);

  // Efecto para actualizar datos cuando cambia el paso
  useEffect(() => {
    const updateQuotationData = async () => {
      // Solo actualizar si hay una cotización válida y no estamos en el primer paso
      if (
        quotationRequest?.id &&
        currentStep > QuotationStep.SUPPLIER_SELECTION &&
        requirement?.id
      ) {
        try {
          const updatedQuotation = await getQuotationByRequirement(
            requirement.id
          );

          if (updatedQuotation) {
            setQuotationRequest(updatedQuotation);

            // Actualizar selectedSuppliers con los datos más recientes
            const updatedSuppliers: SelectedSupplier[] =
              updatedQuotation.quotationSuppliers
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
                      requirementId: updatedQuotation.requirement.id,
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
                      serviceItems:
                        qs.supplierQuotation.supplierQuotationServiceItems
                          .filter(item => item.requirementService)
                          .map(item => ({
                            id: item.id,
                            serviceId: item.requirementService!.id,
                            service: item.requirementService!.service,
                            unitPrice: item.unitPrice || 0,
                            currency: item.currency || 'PEN',
                            deliveryTime: item.deliveryTime || 0,
                            duration: item.duration || 0,
                            durationType: item.durationType || 'DIA',
                            notes: item.notes || '',
                            status: item.status,
                            reasonNotAvailable: item.reasonNotAvailable || '',
                          })),
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
                      requirementId: updatedQuotation.requirement.id,
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

            setSelectedSuppliers(updatedSuppliers);
          }
        } catch (error) {
          console.error('Error al actualizar datos de cotización:', error);
        }
      }
    };

    updateQuotationData();
  }, [
    currentStep,
    quotationRequest?.id,
    requirement?.id,
    getQuotationByRequirement,
  ]);

  const handleStepComplete = async (stepData: SelectedSupplier[]) => {
    // Actualizar selectedSuppliers con los datos del paso
    setSelectedSuppliers(stepData);

    // Solo actualizar en el backend si es el paso de selección de proveedores
    if (currentStep === QuotationStep.SUPPLIER_SELECTION && quotationRequest) {
      const currentSupplierIds = new Set(
        (quotationRequest.quotationSuppliers || [])
          .filter(qs => qs.supplier)
          .map(qs => qs.supplier.id)
      );
      const newSupplierIds = new Set(
        stepData.filter(s => s.supplier).map(s => s.supplier.id)
      );
      const hasChanges =
        currentSupplierIds.size !== newSupplierIds.size ||
        Array.from(currentSupplierIds).some(id => !newSupplierIds.has(id)) ||
        Array.from(newSupplierIds).some(id => !currentSupplierIds.has(id));

      if (hasChanges) {
        const updateData = {
          suppliers: stepData
            .filter(s => s.supplier)
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

    // Recargar datos del backend antes de pasar al siguiente paso
    if (quotationRequest?.id && requirement?.id) {
      try {
        const freshQuotation = await getQuotationByRequirement(requirement.id);

        if (freshQuotation) {
          setQuotationRequest(freshQuotation);

          // Actualizar selectedSuppliers con los datos más recientes
          const updatedSuppliers: SelectedSupplier[] =
            freshQuotation.quotationSuppliers
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
                    requirementId: freshQuotation.requirement.id,
                    receivedAt: new Date(qs.supplierQuotation.receivedAt),
                    validUntil: new Date(qs.supplierQuotation.validUntil),
                    items: qs.supplierQuotation.supplierQuotationItems
                      .filter(item => item.requirementArticle)
                      .map(item => ({
                        id: item.id,
                        requirementArticleId: item.requirementArticle!.id,
                        article: item.requirementArticle!.article,
                        quantity: item.requirementArticle!.quantity,
                        unitPrice: item.unitPrice || 0,
                        totalPrice: item.totalPrice || 0,
                        currency: item.currency || 'PEN',
                        deliveryTime: item.deliveryTime || 0,
                        notes: item.notes || '',
                        status: item.status as QuotationItemStatus,
                        reasonNotAvailable: item.reasonNotAvailable || '',
                      })),
                    serviceItems:
                      qs.supplierQuotation.supplierQuotationServiceItems
                        .filter(item => item.requirementService)
                        .map(item => ({
                          id: item.id,
                          serviceId: item.requirementService!.id,
                          service: item.requirementService!.service,
                          unitPrice: item.unitPrice || 0,
                          currency: item.currency || 'PEN',
                          deliveryTime: item.deliveryTime || 0,
                          duration: item.duration || 0,
                          durationType: item.durationType || 'DIA',
                          notes: item.notes || '',
                          status: item.status,
                          reasonNotAvailable: item.reasonNotAvailable || '',
                        })),
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
                    requirementId: freshQuotation.requirement.id,
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

          setSelectedSuppliers(updatedSuppliers);
        }
      } catch (error) {
        console.error('Error al recargar datos del backend:', error);
        showError(
          'Error al recargar datos',
          'No se pudieron recargar los datos del servidor. Los cambios pueden no estar sincronizados.'
        );
      }
    }

    // Cambiar al siguiente paso
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

  const handleStepBack = async () => {
    if (currentStep > QuotationStep.SUPPLIER_SELECTION) {
      // Recargar datos del backend antes de volver al paso anterior
      if (quotationRequest?.id && requirement?.id) {
        try {
          const freshQuotation = await getQuotationByRequirement(
            requirement.id
          );

          if (freshQuotation) {
            setQuotationRequest(freshQuotation);

            // Actualizar selectedSuppliers con los datos más recientes
            const updatedSuppliers: SelectedSupplier[] =
              freshQuotation.quotationSuppliers
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
                      requirementId: freshQuotation.requirement.id,
                      receivedAt: new Date(qs.supplierQuotation.receivedAt),
                      validUntil: new Date(qs.supplierQuotation.validUntil),
                      items: qs.supplierQuotation.supplierQuotationItems
                        .filter(item => item.requirementArticle)
                        .map(item => ({
                          id: item.id,
                          requirementArticleId: item.requirementArticle!.id,
                          article: item.requirementArticle!.article,
                          quantity: item.requirementArticle!.quantity,
                          unitPrice: item.unitPrice || 0,
                          totalPrice: item.totalPrice || 0,
                          currency: item.currency || 'PEN',
                          deliveryTime: item.deliveryTime || 0,
                          notes: item.notes || '',
                          status: item.status as QuotationItemStatus,
                          reasonNotAvailable: item.reasonNotAvailable || '',
                        })),
                      serviceItems:
                        qs.supplierQuotation.supplierQuotationServiceItems
                          .filter(item => item.requirementService)
                          .map(item => ({
                            id: item.id,
                            serviceId: item.requirementService!.id,
                            service: item.requirementService!.service,
                            unitPrice: item.unitPrice || 0,
                            currency: item.currency || 'PEN',
                            deliveryTime: item.deliveryTime || 0,
                            duration: item.duration || 0,
                            durationType: item.durationType || 'DIA',
                            notes: item.notes || '',
                            status: item.status,
                            reasonNotAvailable: item.reasonNotAvailable || '',
                          })),
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
                      requirementId: freshQuotation.requirement.id,
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

            setSelectedSuppliers(updatedSuppliers);
          }
        } catch (error) {
          console.error(
            'Error al recargar datos del backend al volver:',
            error
          );
          showError(
            'Error al recargar datos',
            'No se pudieron recargar los datos del servidor. Los cambios pueden no estar sincronizados.'
          );
        }
      }

      setCurrentStep(currentStep - 1);
    }
  };

  const handleShowExitModal = () => {
    setShowExitModal(true);
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    onCancel?.();
  };

  const renderStepContent = () => {
    // En el nuevo flujo, siempre tenemos un requerimiento pre-seleccionado
    if (!requirement && !existingQuotation) {
      return (
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No se pudo cargar la cotización
            </p>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case QuotationStep.SUPPLIER_SELECTION:
        return (
          <SupplierSelection
            selectedSuppliers={selectedSuppliers}
            onComplete={handleStepComplete}
          />
        );

      case QuotationStep.GENERATE_ORDERS:
        return (
          <GenerateOrders
            requirement={requirement!}
            quotationRequest={quotationRequest!}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
          />
        );

      case QuotationStep.RECEIVE_QUOTATIONS:
        return (
          <ReceiveQuotations
            requirement={requirement!}
            quotationRequest={quotationRequest!}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
          />
        );

      case QuotationStep.COMPARE_QUOTATIONS:
        return (
          <CompareQuotations
            requirement={requirement!}
            quotationRequest={quotationRequest!}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
          />
        );

      case QuotationStep.FINAL_SELECTION:
        return (
          <FinalSelection
            requirement={requirement!}
            quotationRequest={quotationRequest!}
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
          <div className="flex items-center justify-center">
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
                  <div className="mt-2 text-xs text-center max-w-20">
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
                    className={`w-12 h-0.5 mx-2 ${
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {stepTitles[currentStep]}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stepDescriptions[currentStep]}
              </p>
            </div>
            <Button
              onClick={handleShowExitModal}
              className="text-white border-red-300 hover:bg-black-50  dark:border-black-600 dark:hover:bg-red-900/20 bg-red-500"
            >
              🚪 Salir
            </Button>
          </div>
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

        {/* Exit Confirmation Modal */}
        {showExitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-red-500 text-2xl">⚠️</span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Confirmar Salida
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                <strong>¡Atención!</strong> Estás a punto de salir del proceso
                de cotización.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Todos los cambios no guardados se perderán. Esta acción es
                irreversible.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                ¿Estás seguro de que deseas salir?
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={handleCancelExit}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmExit}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Sí, Salir
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
