import React, { useState, useEffect } from 'react';
import {
  type SelectedSupplier,
  type ReceivedQuotation,
  QuotationItemStatus,
  type CreateSupplierQuotationDto,
  type ReceivedQuotationItem,
  type QuotationRequest,
} from '../../../../types/quotation';
import { useQuotationService } from '../../../../hooks/useQuotationService';
import { useToast } from '../../../../contexts/ToastContext';
import { Button } from '../../../../components/common/Button';
import { FormInput } from '../../../../components/common/FormInput';
import type { Requirement } from '../../../../types/requirement';
import { useCurrentExchangeRate } from '../../../../hooks/useGeneralSettings';
import type { RequirementService } from '../../../../types/requirement';
import type { ServiceQuotationItem } from '../../../../types/quotation';

interface ReceiveQuotationsProps {
  requirement: Requirement;
  quotationRequest: QuotationRequest;
  onComplete: (selectedSuppliers: SelectedSupplier[]) => void;
  onBack: () => void;
}

export const ReceiveQuotations: React.FC<ReceiveQuotationsProps> = ({
  requirement,
  quotationRequest,
  onComplete,
  onBack,
}) => {
  const { data: exchangeRate } = useCurrentExchangeRate();

  // Extraer selectedSuppliers y quotationRequestId de quotationRequest
  const selectedSuppliers: SelectedSupplier[] =
    quotationRequest.quotationSuppliers
      .filter(qs => qs.supplier)
      .map(qs => {
        console.log(qs);
        const selectedSupplier: SelectedSupplier = {
          supplier: qs.supplier,
          isSelected: true,
        };

        // Incluir cotización recibida si existe
        if (qs.supplierQuotation) {
          selectedSupplier.receivedQuotation = {
            id: qs.supplierQuotation.id,
            supplierId: qs.supplier.id,
            requirementId: quotationRequest.requirement.id,
            receivedAt: new Date(qs.supplierQuotation.receivedAt),
            validUntil: new Date(qs.supplierQuotation.validUntil),
            items: qs.supplierQuotation.supplierQuotationItems
              .filter(item => item.requirementArticle) // Filtrar items válidos
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
            serviceItems: qs.supplierQuotation.supplierQuotationServiceItems
              .filter(item => item.requirementService) // Filtrar items válidos
              .map(item => ({
                id: item.id,
                service: item.requirementService!.service,
                unitPrice: item.unitPrice || 0,
                currency: item.currency || 'PEN',
                deliveryTime: item.deliveryTime || 0,
                duration: item.duration || 0,
                durationType: item.durationType || 'DIA',
                notes: item.notes || '',
                status: item.status as QuotationItemStatus,
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

        return selectedSupplier;
      });

  const quotationRequestId = quotationRequest.id;

  const { createSupplierQuotation, submitSupplierQuotation, loading, error } =
    useQuotationService();
  const { showSuccess, showError } = useToast();

  const [quotations, setQuotations] = useState<
    Record<number, ReceivedQuotation>
  >({});
  const [editingSupplier, setEditingSupplier] = useState<number | null>(null);
  const [selectedProductsBySupplier, setSelectedProductsBySupplier] = useState<
    Record<number, number[]>
  >({});

  // 1. Agregar hooks y tipos para manejar servicios
  const [servicesQuotationItems, setServicesQuotationItems] = useState<
    Record<number, ServiceQuotationItem[]>
  >({});

  // Cargar productos seleccionados y cotizaciones guardadas desde los datos recibidos
  useEffect(() => {
    const loadSelectedProducts = () => {
      const productsBySupplier: Record<number, number[]> = {};
      const existingQuotations: Record<number, ReceivedQuotation> = {};
      const servicesBySupplier: Record<number, ServiceQuotationItem[]> = {};

      // Usar los datos de selectedSuppliers que ya vienen actualizados
      selectedSuppliers
        .filter(supplier => supplier.supplier)
        .forEach(selectedSupplier => {
          const supplierId = selectedSupplier.supplier.id;

          // Si hay cotización recibida, usarla
          if (selectedSupplier.receivedQuotation) {
            const quotation = selectedSupplier.receivedQuotation;

            // Cargar productos seleccionados desde la cotización
            const selectedArticleIds = quotation.items
              .map(item => item.requirementArticleId)
              .filter((id): id is number => id !== undefined);
            productsBySupplier[supplierId] = selectedArticleIds;

            existingQuotations[supplierId] = quotation;

            // Cargar servicios desde la cotización existente si existen
            if (quotation.serviceItems && quotation.serviceItems.length > 0) {
              const existingServiceItems = quotation.serviceItems.map(item => ({
                id: item.id || -1,
                service: item.service,
                unitPrice: item.unitPrice || 0,
                currency: item.currency || 'PEN',
                deliveryTime: item.deliveryTime || 0,
                duration: item.duration || 0,
                durationType: item.durationType || 'DIA',
                notes: item.notes || '',
                status: item.status as QuotationItemStatus,
                reasonNotAvailable: item.reasonNotAvailable || '',
              }));
              servicesBySupplier[supplierId] = existingServiceItems;
            }
          } else {
            // Si no hay cotización, usar los productos de las órdenes de cotización
            const quotationSupplier = quotationRequest.quotationSuppliers.find(
              qs => qs.supplier.id === supplierId
            );

            if (
              quotationSupplier &&
              quotationSupplier.quotationSupplierArticles.length > 0
            ) {
              // Usar los productos de las órdenes de cotización
              const selectedArticleIds =
                quotationSupplier.quotationSupplierArticles.map(
                  qsa => qsa.requirementArticle.id
                );
              productsBySupplier[supplierId] = selectedArticleIds;
            } else {
              // Fallback: usar todos los productos
              productsBySupplier[supplierId] =
                requirement.requirementArticles.map(ra => ra.id);
            }
          }

          // Inicializar servicios para todos los proveedores (solo si no hay servicios existentes)
          if (!servicesBySupplier[supplierId]) {
            const selectedServices = requirement.requirementServices || [];
            const initialServiceItems = selectedServices.map(
              (rs: RequirementService) => ({
                id: -1,
                service: rs.service,
                unitPrice: 0,
                currency: rs.currency || 'PEN',
                deliveryTime: 0,
                duration: rs.duration || 0,
                durationType: rs.durationType || 'DIA',
                notes: '',
                status: QuotationItemStatus.NOT_QUOTED,
                reasonNotAvailable: '',
              })
            );
            servicesBySupplier[supplierId] = initialServiceItems;
          }
        });

      setSelectedProductsBySupplier(productsBySupplier);
      setQuotations(existingQuotations);
      setServicesQuotationItems(servicesBySupplier);
    };

    loadSelectedProducts();
  }, [quotationRequest.id, requirement.id]);

  const getSelectedProductsForSupplier = (supplierId: number) => {
    const selectedArticleIds = selectedProductsBySupplier[supplierId] || [];
    return requirement.requirementArticles.filter(ra =>
      selectedArticleIds.includes(ra.id)
    );
  };

  const getSelectedServicesForSupplier = (supplierId: number) => {
    const selectedServiceIds =
      servicesQuotationItems[supplierId]?.map(item => item.service.id) || [];
    return requirement.requirementServices.filter(rs =>
      selectedServiceIds.includes(rs.service.id)
    );
  };

  // Inicializar cotización cuando se selecciona un proveedor
  useEffect(() => {
    if (editingSupplier && !quotations[editingSupplier]) {
      const selectedProducts = getSelectedProductsForSupplier(editingSupplier);
      const selectedServices = getSelectedServicesForSupplier(editingSupplier);
      const initialItems = selectedProducts.map(ra => ({
        id: -1, // index,
        requirementArticleId: ra.id, // Guardar solo el ID del RequirementArticle
        article: ra.article,
        quantity: ra.quantity,
        unitPrice: 0,
        totalPrice: 0,
        currency: ra.currency || 'PEN',
        deliveryTime: 0,
        notes: '',
        status: QuotationItemStatus.NOT_QUOTED,
        reasonNotAvailable: '',
      }));

      const initialServiceItems = selectedServices.map(rs => ({
        id: -1,
        service: rs.service,
        unitPrice: 0,
        currency: rs.currency || 'PEN',
        deliveryTime: 0,
        duration: rs.duration || 0,
        durationType: rs.durationType || 'DIA',
        notes: '',
        status: QuotationItemStatus.NOT_QUOTED,
        reasonNotAvailable: '',
      }));

      const newQuotation: ReceivedQuotation = {
        id: Date.now(),
        supplierId: editingSupplier,
        requirementId: requirement.id,
        receivedAt: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: initialItems,
        serviceItems: initialServiceItems,
        totalAmount: 0,
        status: 'PENDING' as const,
      };

      setQuotations(prev => ({
        ...prev,
        [editingSupplier]: newQuotation,
      }));
    }
  }, [
    editingSupplier,
    requirement.id,
    selectedProductsBySupplier,
    servicesQuotationItems,
  ]);

  const handlePriceChange = (
    supplierId: number,
    articleId: number,
    field: string,
    value: string | number
  ) => {
    setQuotations(prev => {
      const currentQuotation = prev[supplierId];
      if (!currentQuotation) return prev;

      const updatedItems = currentQuotation.items.map(
        (item: ReceivedQuotationItem) => {
          if (item.article.id === articleId) {
            const updatedItem = { ...item };
            if (field === 'unitPrice') {
              const numValue = value === '' ? 0 : Number(value);
              updatedItem.unitPrice = isNaN(numValue) ? 0 : numValue;
              updatedItem.totalPrice =
                updatedItem.unitPrice * updatedItem.quantity;
              updatedItem.status = QuotationItemStatus.QUOTED;
            } else if (field === 'deliveryTime') {
              const numValue = value === '' ? 0 : Number(value);
              updatedItem.deliveryTime = isNaN(numValue) ? 0 : numValue;
            } else if (field === 'notes') {
              updatedItem.notes = String(value);
            } else if (field === 'reasonNotAvailable') {
              updatedItem.reasonNotAvailable = String(value);
            } else if (field === 'currency') {
              updatedItem.currency = String(value);
            }
            return updatedItem;
          }
          return item;
        }
      );

      // Calcular totales por moneda
      const totalsByCurrency: Record<string, number> = {};
      updatedItems
        .filter(
          (item: ReceivedQuotationItem) =>
            item.status === QuotationItemStatus.QUOTED
        )
        .forEach((item: ReceivedQuotationItem) => {
          const currency = item.currency || 'PEN';
          const totalPrice =
            item.unitPrice && !isNaN(+item.unitPrice)
              ? +item.unitPrice * item.quantity
              : 0;
          totalsByCurrency[currency] =
            (totalsByCurrency[currency] || 0) + totalPrice;
        });

      return {
        ...prev,
        [supplierId]: {
          ...currentQuotation,
          items: updatedItems,
          totalAmount: Object.values(totalsByCurrency).reduce(
            (sum, total) => sum + total,
            0
          ),
        },
      };
    });
  };

  const handleStatusChange = (
    supplierId: number,
    articleId: number,
    status: QuotationItemStatus
  ) => {
    setQuotations(prev => {
      const currentQuotation = prev[supplierId];
      if (!currentQuotation) return prev;

      const updatedItems = currentQuotation.items.map(
        (item: ReceivedQuotationItem) => {
          if (item.article.id === articleId) {
            const updatedItem = { ...item, status };

            // Resetear campos según el estado
            if (status === QuotationItemStatus.NOT_AVAILABLE) {
              updatedItem.unitPrice = 0;
              updatedItem.totalPrice = 0;
              updatedItem.deliveryTime = 0;
            } else if (status === QuotationItemStatus.NOT_QUOTED) {
              updatedItem.unitPrice = 0;
              updatedItem.totalPrice = 0;
              updatedItem.deliveryTime = 0;
              updatedItem.reasonNotAvailable = '';
            }

            return updatedItem;
          }
          return item;
        }
      );

      // Calcular totales por moneda
      const totalsByCurrency: Record<string, number> = {};
      updatedItems
        .filter(
          (item: ReceivedQuotationItem) =>
            item.status === QuotationItemStatus.QUOTED
        )
        .forEach((item: ReceivedQuotationItem) => {
          const currency = item.currency || 'PEN';
          const totalPrice =
            item.totalPrice && !isNaN(+item.totalPrice) ? +item.totalPrice : 0;
          totalsByCurrency[currency] =
            (totalsByCurrency[currency] || 0) + totalPrice;
        });

      return {
        ...prev,
        [supplierId]: {
          ...currentQuotation,
          items: updatedItems,
          totalAmount: Object.values(totalsByCurrency).reduce(
            (sum, total) => sum + total,
            0
          ),
        },
      };
    });
  };

  // 4. Handlers para editar servicios
  const handleServiceChange = (
    supplierId: number,
    serviceId: number,
    field: string,
    value: string | number
  ) => {
    setServicesQuotationItems(prev => {
      const current = prev[supplierId] || [];
      const updated = current.map(item => {
        if (item.service.id === serviceId) {
          const updatedItem = { ...item };
          if (field === 'unitPrice') {
            const numValue = value === '' ? 0 : Number(value);
            updatedItem.unitPrice = isNaN(numValue) ? 0 : numValue;
            updatedItem.status = QuotationItemStatus.QUOTED;
          } else if (field === 'deliveryTime') {
            const numValue = value === '' ? 0 : Number(value);
            updatedItem.deliveryTime = isNaN(numValue) ? 0 : numValue;
          } else if (field === 'duration') {
            const numValue = value === '' ? 0 : Number(value);
            updatedItem.duration = isNaN(numValue) ? 0 : numValue;
          } else if (field === 'durationType') {
            updatedItem.durationType = String(value) as
              | 'HORA'
              | 'CONTRATO'
              | 'DIA'
              | 'JORNADA';
          } else if (field === 'notes') {
            updatedItem.notes = String(value);
          } else if (field === 'reasonNotAvailable') {
            updatedItem.reasonNotAvailable = String(value);
          } else if (field === 'currency') {
            updatedItem.currency = String(value);
          }
          return updatedItem;
        }
        return item;
      });
      return { ...prev, [supplierId]: updated };
    });
  };

  const handleServiceStatusChange = (
    supplierId: number,
    serviceId: number,
    status: QuotationItemStatus
  ) => {
    setServicesQuotationItems(prev => {
      const current = prev[supplierId] || [];
      const updated = current.map(item => {
        if (item.service.id === serviceId) {
          const updatedItem = { ...item, status };
          if (status === QuotationItemStatus.NOT_AVAILABLE) {
            updatedItem.unitPrice = 0;
            updatedItem.deliveryTime = 0;
          } else if (status === QuotationItemStatus.NOT_QUOTED) {
            updatedItem.unitPrice = 0;
            updatedItem.deliveryTime = 0;
            updatedItem.reasonNotAvailable = '';
          }
          return updatedItem;
        }
        return item;
      });
      return { ...prev, [supplierId]: updated };
    });
  };

  const handleSaveDraft = async (supplierId: number) => {
    const quotation = quotations[supplierId];
    if (!quotation) return;

    setQuotations(prev => ({
      ...prev,
      [supplierId]: {
        ...prev[supplierId]!,
        status: 'DRAFT',
      },
    }));

    const createData: CreateSupplierQuotationDto = {
      quotationRequestId: quotationRequestId,
      supplierId: supplierId,
      notes: quotation.notes || '',
      items: quotation.items
        .filter(
          item =>
            item.requirementArticleId &&
            typeof item.requirementArticleId === 'number'
        ) // Filtrar items que tengan requirementArticleId válido
        .map(item => ({
          articleId: item.requirementArticleId!, // Ya verificamos que existe arriba
          quantity: item.quantity,
          unitPrice:
            item.status === QuotationItemStatus.QUOTED
              ? item.unitPrice
              : undefined,
          deliveryTime:
            item.status === QuotationItemStatus.QUOTED
              ? item.deliveryTime
              : undefined,
          currency: item.currency || 'PEN',
          notes: item.notes || undefined,
          status: item.status,
          reasonNotAvailable: item.reasonNotAvailable || undefined,
        })),
      serviceItems: (servicesQuotationItems[supplierId] || [])
        .filter(item => item.service)
        .map(item => ({
          serviceId: item.service.id,
          unitPrice:
            item.status === QuotationItemStatus.QUOTED
              ? item.unitPrice
              : undefined,
          deliveryTime:
            item.status === QuotationItemStatus.QUOTED
              ? item.deliveryTime
              : undefined,
          currency: item.currency || 'PEN',
          notes: item.notes || undefined,
          status: item.status,
          reasonNotAvailable: item.reasonNotAvailable || undefined,
          duration: item.duration,
          durationType: item.durationType,
        })),
    };

    const createdQuotation = await createSupplierQuotation(createData);
    if (createdQuotation) {
      setQuotations(prev => ({
        ...prev,
        [supplierId]: {
          ...prev[supplierId]!,
          id: createdQuotation.id,
          status: 'DRAFT',
          updatedAt: new Date(),
        },
      }));
      showSuccess(
        'Borrador guardado',
        'La cotización se ha guardado como borrador exitosamente'
      );
      return createdQuotation;
    } else {
      showError(
        'Error al guardar',
        error || 'No se pudo guardar el borrador. Inténtalo de nuevo.'
      );
      return null;
    }
  };

  const handleSubmitQuotation = async (supplierId: number) => {
    const quotation = quotations[supplierId];
    if (!quotation) {
      return;
    }

    try {
      let quotationId = quotation.id;

      // Primero crear la cotización si no existe o tiene ID temporal
      if (!quotationId || quotationId < 0) {
        // IDs temporales son menores a 1000
        const savedQuotation = await handleSaveDraft(supplierId);

        // Si no se pudo guardar, mostrar error
        if (!savedQuotation) {
          showError(
            'Error al guardar',
            'No se pudo guardar la cotización antes de enviarla'
          );
          return;
        }

        // Obtener el ID de la cotización guardada
        quotationId = savedQuotation.id;
      }

      // Luego enviar la cotización si tenemos un ID válido
      if (quotationId && quotationId >= 0) {
        const submittedQuotation = await submitSupplierQuotation(quotationId);

        if (submittedQuotation) {
          // Solo actualizar el estado, mantener todos los datos existentes
          setQuotations(prev => ({
            ...prev,
            [supplierId]: {
              ...prev[supplierId]!,
              status: 'SUBMITTED',
              updatedAt: new Date(),
            },
          }));
          showSuccess(
            'Cotización enviada',
            'La cotización se ha enviado exitosamente'
          );
          setEditingSupplier(null);
        } else {
          showError(
            'Error al enviar cotización',
            'No se pudo enviar la cotización. Inténtalo de nuevo.'
          );
        }
      } else {
        showError(
          'Error al enviar cotización',
          'No se pudo obtener un ID válido para la cotización'
        );
      }
    } catch (error) {
      showError(
        'Error al enviar cotización',
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al enviar la cotización. Inténtalo de nuevo.'
      );
    }
  };

  const handleContinue = () => {
    const updatedSuppliers = selectedSuppliers.map(supplier => ({
      ...supplier,
      receivedQuotation: quotations[supplier.supplier.id],
    }));

    if (Object.values(quotations).length !== selectedSuppliers.length) {
      showError(
        'Error al enviar cotización',
        'No se han enviado todas las cotizaciones. Por favor, complete todas las cotizaciones antes de continuar.'
      );
      return;
    }

    if (
      Object.values(quotations).some(quotation => quotation.status === 'DRAFT')
    ) {
      showError(
        'Error al enviar cotización',
        'No se han enviado todas las cotizaciones. Por favor, complete todas las cotizaciones antes de continuar.'
      );
      return;
    }
    onComplete(updatedSuppliers);
  };

  const getTotalsByCurrency = (supplierId: number) => {
    const quotation = quotations[supplierId];
    if (!quotation) return {};

    const totalsByCurrency: Record<string, number> = {};
    quotation.items
      .filter(item => item.status === QuotationItemStatus.QUOTED)
      .forEach((item: ReceivedQuotationItem) => {
        const currency = item.currency || 'PEN';
        const totalPrice =
          item.unitPrice && !isNaN(+item.unitPrice)
            ? +item.unitPrice * item.quantity
            : 0;
        totalsByCurrency[currency] =
          (totalsByCurrency[currency] || 0) + totalPrice;
      });

    return totalsByCurrency;
  };

  const getQuotationStatus = (supplierId: number) => {
    const quotation = quotations[supplierId];
    if (!quotation) return 'PENDIENTE';
    return quotation.status === 'SUBMITTED'
      ? 'ENVIADA'
      : quotation.status === 'DRAFT'
        ? 'BORRADOR'
        : 'PENDIENTE';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENVIADA':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'BORRADOR':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSelectedProductsCount = (supplierId: number) => {
    const servicesCount = servicesQuotationItems[supplierId]?.length || 0;
    const productsCount = getSelectedProductsForSupplier(supplierId).length;
    return servicesCount + productsCount;
  };

  const getItemStatusColor = (status: QuotationItemStatus) => {
    switch (status) {
      case QuotationItemStatus.QUOTED:
        return 'bg-green-50 dark:bg-green-900/20';
      case QuotationItemStatus.NOT_AVAILABLE:
        return 'bg-red-50 dark:bg-red-900/20';
      case QuotationItemStatus.NOT_QUOTED:
        return 'bg-gray-50 dark:bg-gray-900/20';
      default:
        return '';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Ingreso de Cotizaciones Recibidas
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ingresa las cotizaciones recibidas de cada proveedor para los
          productos solicitados específicamente a cada uno
        </p>
      </div>

      {/* Suppliers Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {selectedSuppliers
              .filter(selectedSupplier => selectedSupplier.supplier) // Filtrar proveedores válidos
              .map(selectedSupplier => {
                const supplier = selectedSupplier.supplier;
                const status = getQuotationStatus(supplier.id);
                const isActive = editingSupplier === supplier.id;
                const selectedCount = getSelectedProductsCount(supplier.id);

                return (
                  <button
                    key={supplier.id}
                    onClick={() => setEditingSupplier(supplier.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{supplier.businessName}</span>
                      <span className="text-xs text-gray-400">
                        ({selectedCount} productos)
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                      >
                        {status}
                      </span>
                    </div>
                  </button>
                );
              })}
          </nav>
        </div>
      </div>

      {/* Quotation Form */}
      {editingSupplier && quotations[editingSupplier] && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Cotización -{' '}
                  {selectedSuppliers.find(
                    s => s.supplier && s.supplier.id === editingSupplier
                  )?.supplier?.businessName || 'Proveedor'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Productos solicitados específicamente a este proveedor
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleSaveDraft(editingSupplier)}
                  className="text-sm"
                  disabled={loading}
                >
                  💾 Guardar borrador
                </Button>
                <Button
                  onClick={() => {
                    handleSubmitQuotation(editingSupplier);
                  }}
                  className="text-sm"
                  disabled={
                    loading ||
                    !editingSupplier ||
                    quotations[editingSupplier].status !== 'DRAFT'
                  }
                >
                  ✅ Enviar cotización
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Quotation Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <FormInput
                label="Fecha de recepción"
                type="date"
                value={
                  quotations[editingSupplier]?.receivedAt
                    .toISOString()
                    .split('T')[0] || new Date().toISOString().split('T')[0]
                }
                onChange={e => {
                  setQuotations(prev => ({
                    ...prev,
                    [editingSupplier]: {
                      ...prev[editingSupplier]!,
                      receivedAt: new Date(e.target.value),
                    },
                  }));
                }}
              />
              <FormInput
                label="Válida hasta"
                type="date"
                value={
                  quotations[editingSupplier]?.validUntil
                    .toISOString()
                    .split('T')[0] ||
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0]
                }
                onChange={e => {
                  setQuotations(prev => ({
                    ...prev,
                    [editingSupplier]: {
                      ...prev[editingSupplier]!,
                      validUntil: new Date(e.target.value),
                    },
                  }));
                }}
              />
            </div>

            {/* Products Table */}
            {quotations[editingSupplier].items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Moneda
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Precio Unitario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tiempo Entrega (días)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Notas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {quotations[editingSupplier].items.map(item => (
                      <tr
                        key={item.article.id}
                        className={getItemStatusColor(item.status)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.article.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.article.code}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <select
                              value={item.status}
                              onChange={e =>
                                handleStatusChange(
                                  editingSupplier,
                                  item.article.id,
                                  e.target.value as QuotationItemStatus
                                )
                              }
                              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-xs"
                            >
                              <option value={QuotationItemStatus.QUOTED}>
                                Cotizado
                              </option>
                              <option value={QuotationItemStatus.NOT_AVAILABLE}>
                                No Disponible
                              </option>
                              <option value={QuotationItemStatus.NOT_QUOTED}>
                                No Cotizado
                              </option>
                            </select>

                            {item.status ===
                              QuotationItemStatus.NOT_AVAILABLE && (
                              <FormInput
                                placeholder="Razón de no disponibilidad..."
                                value={item.reasonNotAvailable || ''}
                                onChange={e =>
                                  handlePriceChange(
                                    editingSupplier,
                                    item.article.id,
                                    'reasonNotAvailable',
                                    e.target.value
                                  )
                                }
                                className="text-xs"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={item.currency || 'PEN'}
                            onChange={e =>
                              handlePriceChange(
                                editingSupplier,
                                item.article.id,
                                'currency',
                                e.target.value
                              )
                            }
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-xs"
                            disabled={
                              item.status !== QuotationItemStatus.QUOTED
                            }
                          >
                            <option value="PEN">PEN</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <FormInput
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice || ''}
                            onChange={e =>
                              handlePriceChange(
                                editingSupplier,
                                item.article.id,
                                'unitPrice',
                                e.target.value
                              )
                            }
                            className="w-24"
                            disabled={
                              item.status !== QuotationItemStatus.QUOTED
                            }
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.currency || 'PEN'}{' '}
                          {item.unitPrice && !isNaN(+item.unitPrice)
                            ? (+item.unitPrice * item.quantity).toFixed(2)
                            : '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <FormInput
                            type="number"
                            min="0"
                            value={item.deliveryTime || ''}
                            onChange={e =>
                              handlePriceChange(
                                editingSupplier,
                                item.article.id,
                                'deliveryTime',
                                e.target.value
                              )
                            }
                            className="w-20"
                            disabled={
                              item.status !== QuotationItemStatus.QUOTED
                            }
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <FormInput
                            value={item.notes}
                            onChange={e =>
                              handlePriceChange(
                                editingSupplier,
                                item.article.id,
                                'notes',
                                e.target.value
                              )
                            }
                            placeholder="Comentarios..."
                            className="w-32"
                            disabled={
                              item.status === QuotationItemStatus.NOT_AVAILABLE
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Services Table */}
            {servicesQuotationItems[editingSupplier].length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Servicio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Duración
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Moneda
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Precio Unitario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Notas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {servicesQuotationItems[editingSupplier].map(item => (
                      <tr
                        key={item.service.id}
                        className={getItemStatusColor(item.status)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.service.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.service.code}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <select
                              value={item.status}
                              onChange={e =>
                                handleServiceStatusChange(
                                  editingSupplier,
                                  item.service.id,
                                  e.target.value as QuotationItemStatus
                                )
                              }
                              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-xs"
                            >
                              <option value={QuotationItemStatus.QUOTED}>
                                Cotizado
                              </option>
                              <option value={QuotationItemStatus.NOT_AVAILABLE}>
                                No Disponible
                              </option>
                              <option value={QuotationItemStatus.NOT_QUOTED}>
                                No Cotizado
                              </option>
                            </select>
                            {item.status ===
                              QuotationItemStatus.NOT_AVAILABLE && (
                              <FormInput
                                placeholder="Razón de no disponibilidad..."
                                value={item.reasonNotAvailable || ''}
                                onChange={e =>
                                  handleServiceChange(
                                    editingSupplier,
                                    item.service.id,
                                    'reasonNotAvailable',
                                    e.target.value
                                  )
                                }
                                className="text-xs"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <FormInput
                            type="number"
                            min="0"
                            value={item.duration || ''}
                            onChange={e =>
                              handleServiceChange(
                                editingSupplier,
                                item.service.id,
                                'duration',
                                e.target.value
                              )
                            }
                            className="w-20"
                            disabled={
                              item.status !== QuotationItemStatus.QUOTED
                            }
                          />
                        </td>
                        <td className="px-1 py-4 whitespace-nowrap">
                          <select
                            value={item.durationType || ''}
                            onChange={e =>
                              handleServiceChange(
                                editingSupplier,
                                item.service.id,
                                'durationType',
                                e.target.value
                              )
                            }
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-xs"
                            disabled={
                              item.status !== QuotationItemStatus.QUOTED
                            }
                          >
                            <option value="DIA">Día</option>
                            <option value="HORA">Hora</option>
                            <option value="CONTRATO">Contrato</option>
                            <option value="JORNADA">Jornada</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={item.currency || 'PEN'}
                            onChange={e =>
                              handleServiceChange(
                                editingSupplier,
                                item.service.id,
                                'currency',
                                e.target.value
                              )
                            }
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-xs"
                            disabled={
                              item.status !== QuotationItemStatus.QUOTED
                            }
                          >
                            <option value="PEN">PEN</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <FormInput
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice || ''}
                            onChange={e =>
                              handleServiceChange(
                                editingSupplier,
                                item.service.id,
                                'unitPrice',
                                e.target.value
                              )
                            }
                            className="w-24"
                            disabled={
                              item.status !== QuotationItemStatus.QUOTED
                            }
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.currency || 'PEN'}{' '}
                          {item.unitPrice && !isNaN(+item.unitPrice)
                            ? (+item.unitPrice * 1).toFixed(2)
                            : '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <FormInput
                            value={item.notes}
                            onChange={e =>
                              handleServiceChange(
                                editingSupplier,
                                item.service.id,
                                'notes',
                                e.target.value
                              )
                            }
                            placeholder="Comentarios..."
                            className="w-32"
                            disabled={
                              item.status === QuotationItemStatus.NOT_AVAILABLE
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total by Currency */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Totales por Moneda
              </h5>
              <div className="space-y-2">
                {Object.entries(getTotalsByCurrency(editingSupplier)).map(
                  ([currency, total]) => (
                    <div
                      key={currency}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total en {currency}:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {currency === 'USD' ? (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Tipo de cambio: {exchangeRate?.saleRate} / PEN{' '}
                            {(total * (exchangeRate?.saleRate || 0)).toFixed(
                              2
                            )}{' '}
                          </span>
                        ) : null}
                        {currency} {(+total).toFixed(2)}
                      </span>
                    </div>
                  )
                )}
                {Object.keys(getTotalsByCurrency(editingSupplier)).length ===
                  0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    No hay productos cotizados
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <FormInput
                label="Notas adicionales"
                type="textarea"
                value={quotations[editingSupplier]?.notes || ''}
                onChange={e => {
                  setQuotations(prev => ({
                    ...prev,
                    [editingSupplier]: {
                      ...prev[editingSupplier]!,
                      notes: e.target.value,
                    },
                  }));
                }}
                placeholder="Ingresa notas adicionales sobre la cotización..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Total proveedores:
            </span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {selectedSuppliers.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Cotizaciones ingresadas:
            </span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {Object.keys(quotations).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Enviadas:</span>
            <span className="ml-2 font-medium text-green-600 dark:text-green-400">
              {
                Object.values(quotations).filter(q => q.status === 'SUBMITTED')
                  .length
              }
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">
              Borradores:
            </span>
            <span className="ml-2 font-medium text-yellow-600 dark:text-yellow-400">
              {
                Object.values(quotations).filter(q => q.status === 'DRAFT')
                  .length
              }
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onBack}>← Volver</Button>
        <Button
          onClick={handleContinue}
          disabled={Object.keys(quotations).length === 0 || loading}
        >
          Continuar al siguiente paso
        </Button>
      </div>
    </div>
  );
};
