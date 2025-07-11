import React, { useState, useEffect } from 'react';
import { usePaymentService } from '../../../hooks/usePaymentService';
import { useToast } from '../../../contexts/ToastContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import { FormInput } from '../../../components/common/FormInput';
import { FormText } from '../../../components/common/FormText';
import { FormInputDate } from '../../../components/common/FormInputDate';
import {
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getPaymentDetailStatusText,
  getPaymentDetailStatusColor,
} from '../../../utils/paymentUtils';
import { PaymentStatus } from '../../../types/payment';
import type {
  PaymentGroup,
  CreatePaymentDetailDto,
} from '../../../types/payment';
import { hasPermission } from '../../../utils/permissions';
import { Modal } from '../../../components/common/Modal';
import { SupplierDetails } from '../../supplier/components/SupplierDetails';

export const PaymentDetails: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const {
    getPaymentGroup,
    loading,
    createPaymentDetail,
    updatePaymentDetailReceipt,
    updatePaymentDetailInvoice,
  } = usePaymentService();
  const { showError, showSuccess } = useToast();

  const [payment, setPayment] = useState<PaymentGroup | null>(null);

  // Modal states
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    'receipt' | 'invoiceImage' | 'invoiceData'
  >('receipt');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // Form data
  const [formData, setFormData] = useState({
    receipt: {
      paymentReceipt: '',
      amount: 0,
      depositDate: new Date().toISOString().split('T')[0],
      movementNumber: '',
      receiptImage: null as File | null,
      receiptImagePreview: '',
    },
    invoice: {
      invoiceEmissionDate: '',
      documentNumber: '',
      description: '',
      retentionAmount: 0,
      retentionPercentage: 3.0,
      hasRetention: false,
      invoiceImage: null as File | null,
      invoiceImagePreview: '',
    },
  });

  useEffect(() => {
    const loadPayment = async () => {
      if (params.id) {
        const result = await getPaymentGroup(Number(params.id));
        if (result) {
          setPayment(result);
          // Initialize amount with pending amount
          if (result.pendingAmount > 0) {
            setFormData(prev => ({
              ...prev,
              receipt: {
                ...prev.receipt,
                amount: result.pendingAmount,
              },
            }));
          }
        }
      }
    };
    loadPayment();
  }, [params.id, getPaymentGroup]);

  const handleDataChange = (
    type: 'receipt' | 'invoice',
    field: string,
    value: string | number | boolean | File | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleFileChange = (
    type: 'receipt' | 'invoice',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      handleDataChange(type, `${type}Image`, file);
    } else {
      handleDataChange(type, `${type}Image`, null);
    }
  };

  const handleSaveReceipt = async () => {
    if (!payment) return;

    // Validate required fields
    if (!formData.receipt.receiptImage) {
      showError('Error', 'La imagen del comprobante de pago es obligatoria');
      return;
    }

    if (!formData.receipt.depositDate) {
      showError('Error', 'La fecha de depósito es obligatoria');
      return;
    }

    if (!formData.receipt.movementNumber) {
      showError('Error', 'El número de movimiento bancario es obligatorio');
      return;
    }

    // Validate amount doesn't exceed pending amount
    const pendingAmount = payment.pendingAmount;
    const amountToPay = formData.receipt.amount;

    if (amountToPay > pendingAmount) {
      showError(
        'Error',
        `El monto a pagar (S/ ${amountToPay.toFixed(2)}) no puede superar el monto pendiente (S/ ${pendingAmount.toFixed(2)})`
      );
      return;
    }

    if (amountToPay <= 0) {
      showError('Error', 'El monto debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a new payment detail
      const paymentDetailData: CreatePaymentDetailDto = {
        code: `${payment.code}-${payment.paymentDetails.length + 1}`,
        amount: formData.receipt.amount,
        description: `Pago para ${payment.purchaseOrder.supplierName}`,
        paymentGroupId: payment.id,
      };

      const newPaymentDetail = await createPaymentDetail(paymentDetailData);

      if (newPaymentDetail) {
        // Update receipt information
        await updatePaymentDetailReceipt(
          newPaymentDetail.id,
          {
            paymentReceipt: formData.receipt.paymentReceipt,
            depositDate: formData.receipt.depositDate,
            movementNumber: formData.receipt.movementNumber,
            description: `Pago para ${payment.purchaseOrder.supplierName}`,
          },
          formData.receipt.receiptImage
        );

        showSuccess('Pago registrado exitosamente');

        // Clear form and close modal
        resetForm();
        setShowAddPaymentModal(false);
      }

      // Reload payment data
      const updatedPayment = await getPaymentGroup(payment.id);
      if (updatedPayment) {
        setPayment(updatedPayment);
      }
    } catch (error) {
      console.error('Error saving receipt data:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al guardar recibo', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveInvoiceImage = async (paymentDetailId: number) => {
    if (!payment) return;

    // Validate required fields
    if (!formData.invoice.invoiceImage) {
      showError('Error', 'La imagen de la factura es obligatoria');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update invoice image only
      await updatePaymentDetailInvoice(
        paymentDetailId,
        {
          invoiceEmissionDate: '',
          documentNumber: '',
          description: '',
        },
        formData.invoice.invoiceImage
      );

      showSuccess('Imagen de factura subida exitosamente');

      // Close modal and reset form
      resetForm();
      setShowAddPaymentModal(false);

      // Reload payment data
      const updatedPayment = await getPaymentGroup(payment.id);
      if (updatedPayment) {
        setPayment(updatedPayment);
      }
    } catch (error) {
      console.error('Error saving invoice image:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al subir factura', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveInvoiceData = async (paymentDetailId: number) => {
    if (!payment) return;

    // Validate required fields
    if (!formData.invoice.invoiceEmissionDate) {
      showError('Error', 'La fecha de emisión de la factura es obligatoria');
      return;
    }

    if (!formData.invoice.documentNumber) {
      showError('Error', 'El número de documento es obligatorio');
      return;
    }

    if (!formData.invoice.description) {
      showError('Error', 'La descripción es obligatoria');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update invoice information only (no image)
      const invoiceData = {
        invoiceEmissionDate: formData.invoice.invoiceEmissionDate,
        documentNumber: formData.invoice.documentNumber,
        description: formData.invoice.description,
      };

      await updatePaymentDetailInvoice(
        paymentDetailId,
        invoiceData,
        undefined // No image update
      );

      showSuccess('Información de la factura actualizada exitosamente');

      // Clear form and close modal
      resetForm();
      setShowAddPaymentModal(false);

      // Reload payment data
      const updatedPayment = await getPaymentGroup(payment.id);
      if (updatedPayment) {
        setPayment(updatedPayment);
      }
    } catch (error) {
      console.error('Error saving invoice data:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al guardar datos de factura', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      receipt: {
        paymentReceipt: '',
        amount: payment?.pendingAmount || 0,
        depositDate: new Date().toISOString().split('T')[0],
        movementNumber: '',
        receiptImage: null,
        receiptImagePreview: '',
      },
      invoice: {
        invoiceEmissionDate: '',
        documentNumber: '',
        description: '',
        retentionAmount: 0,
        retentionPercentage: 3.0,
        hasRetention: false,
        invoiceImage: null,
        invoiceImagePreview: '',
      },
    });
    setCurrentStep('receipt');
  };

  const openAddPaymentModal = () => {
    resetForm();
    setShowAddPaymentModal(true);
  };

  const closeAddPaymentModal = () => {
    setShowAddPaymentModal(false);
    resetForm();
  };

  // Function to download file from URL
  const downloadFile = async (url: string, baseFilename: string) => {
    try {
      // For Cloudinary URLs, we need to handle PDFs differently
      let downloadUrl = url;

      // If it's a Cloudinary URL and might be a PDF, try to force download
      if (url.includes('cloudinary.com')) {
        // Check if URL already has parameters
        const separator = url.includes('?') ? '&' : '?';
        downloadUrl = `${url}${separator}fl_attachment`;
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('No se pudo descargar el archivo');
      }

      // Get content type to determine file extension
      const contentType = response.headers.get('content-type');
      let extension = '.pdf'; // default

      if (contentType) {
        if (
          contentType.includes('image/jpeg') ||
          contentType.includes('image/jpg')
        ) {
          extension = '.jpg';
        } else if (contentType.includes('image/png')) {
          extension = '.png';
        } else if (contentType.includes('image/gif')) {
          extension = '.gif';
        } else if (contentType.includes('image/webp')) {
          extension = '.webp';
        } else if (contentType.includes('application/pdf')) {
          extension = '.pdf';
        }
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${baseFilename}${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      showError('Error al descargar', 'No se pudo descargar el archivo');
    }
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (formData.receipt.receiptImage) {
        URL.revokeObjectURL(URL.createObjectURL(formData.receipt.receiptImage));
      }
      if (formData.invoice.invoiceImage) {
        URL.revokeObjectURL(URL.createObjectURL(formData.invoice.invoiceImage));
      }
    };
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!payment)
    return <div className="text-red-500">Grupo de pagos no encontrado</div>;

  const canEdit =
    payment.status === PaymentStatus.PENDING ||
    payment.status === PaymentStatus.PARTIAL;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Detalles del Grupo de Pagos
            </h1>
            <h2 className="text-sm text-gray-600 dark:text-gray-400">
              {payment.code}
            </h2>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => navigate(ROUTES.PAYMENTS)}>Volver</Button>
            {payment.pendingAmount > 0 && hasPermission('create_payment') && (
              <Button
                onClick={openAddPaymentModal}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                + Añadir Pago
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
            payment.status
          )}`}
        >
          {getPaymentStatusLabel(payment.status)}
        </span>
      </div>

      {/* General Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Información General
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {payment.description || 'Sin descripción'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notas
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {payment.notes || 'Sin notas'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Orden de Compra Asociada
              </label>
              <button
                onClick={() => {
                  const url = ROUTES.PURCHASE_ORDER_DETAILS.replace(
                    ':id',
                    payment.purchaseOrder.id.toString()
                  );
                  window.open(url, '_blank');
                }}
                className="mt-1 bg-gray-100 dark:bg-gray-700 rounded-md inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                {payment.purchaseOrder.code}
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Montos
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Monto Total
              </label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                S/ {(+payment.totalAmount).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Monto Pagado
              </label>
              <p className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
                S/ {(+payment.paidAmount).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Monto Pendiente
              </label>
              <p className="mt-1 text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                S/ {(+payment.pendingAmount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details - Visual Cards */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Detalles de Pagos ({payment.paymentDetails.length})
        </h3>
        {payment.paymentDetails.length > 0 ? (
          <div className="space-y-4">
            {payment.paymentDetails.map(detail => (
              <div
                key={detail.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {detail.code}
                    </h4>
                    <div
                      className="mt-1 cursor-pointer hover:underline rounded-md p-2"
                      onClick={() => setShowDetailsModal(true)}
                    >
                      <p className="text-base font-medium text-blue-600 dark:text-blue-400">
                        {payment.purchaseOrder.supplierName}
                      </p>
                      {payment.purchaseOrder.supplierRUC && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          RUC: {payment.purchaseOrder.supplierRUC}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentDetailStatusColor(
                        detail.status
                      )}`}
                    >
                      {getPaymentDetailStatusText(detail.status)}
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        S/ {(+detail.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Receipt Information */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Comprobante de Pago
                      </h5>
                      {detail.receiptImage && (
                        <Button
                          onClick={() =>
                            downloadFile(
                              detail.receiptImage!,
                              `comprobante-${detail.code}`
                            )
                          }
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1"
                        >
                          📥 Descargar
                        </Button>
                      )}
                    </div>
                    {detail.movementNumber ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Movimiento:
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {detail.movementNumber}
                          </span>
                        </div>

                        {detail.depositDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Fecha:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(
                                detail.depositDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sin comprobante registrado
                      </p>
                    )}
                  </div>

                  {/* Invoice Information */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Factura
                      </h5>
                      {detail.invoiceImage && (
                        <Button
                          onClick={() =>
                            downloadFile(
                              detail.invoiceImage!,
                              `factura-${detail.code}`
                            )
                          }
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1"
                        >
                          📥 Descargar
                        </Button>
                      )}
                    </div>
                    {detail.documentNumber ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Documento:
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {detail.documentNumber}
                          </span>
                        </div>
                        {detail.invoiceEmissionDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Emisión:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(
                                detail.invoiceEmissionDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {detail.description && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Descripción:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {detail.description}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sin factura registrada
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Acciones
                    </h5>
                    <div className="space-y-2">
                      {/* Add Invoice Image Button */}
                      {detail.paymentReceipt &&
                        !detail.invoiceImage &&
                        canEdit && (
                          <Button
                            onClick={() => {
                              setCurrentStep('invoiceImage');
                              setShowAddPaymentModal(true);
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
                          >
                            + Subir Factura
                          </Button>
                        )}

                      {/* Add Invoice Data Button */}
                      {detail.invoiceImage &&
                        !detail.documentNumber &&
                        canEdit && (
                          <Button
                            onClick={() => {
                              setCurrentStep('invoiceData');
                              setShowAddPaymentModal(true);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            + Datos Factura
                          </Button>
                        )}

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Creado por:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {detail.createdBy.firstName}{' '}
                          {detail.createdBy.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Fecha:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(detail.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No hay detalles de pago registrados
            </p>
          </div>
        )}
      </div>

      {/* Audit Information */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Información de Auditoría
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {payment.approvedBy && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Aprobado por
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {payment.approvedBy.firstName} {payment.approvedBy.lastName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentStep === 'receipt'
                  ? 'Añadir Pago'
                  : currentStep === 'invoiceImage'
                    ? 'Subir Factura'
                    : 'Datos de Factura'}
              </h2>
              <button
                onClick={closeAddPaymentModal}
                className="bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Receipt Form */}
            {currentStep === 'receipt' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información de la Boleta de Pago
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Número de Movimiento Bancario"
                    value={formData.receipt.movementNumber}
                    onChange={e =>
                      handleDataChange(
                        'receipt',
                        'movementNumber',
                        e.target.value
                      )
                    }
                    placeholder="Número de movimiento bancario"
                    disabled={!canEdit}
                  />

                  <FormInput
                    label="Monto a Pagar"
                    type="number"
                    step="0.01"
                    value={formData.receipt.amount}
                    onChange={e => {
                      const newAmount = parseFloat(e.target.value) || 0;
                      const pendingAmount = payment.pendingAmount;
                      if (newAmount > pendingAmount) {
                        showError(
                          'Error',
                          `El monto no puede superar S/ ${pendingAmount.toFixed(2)}`
                        );
                        return;
                      }
                      handleDataChange('receipt', 'amount', newAmount);
                    }}
                    disabled={!canEdit}
                    max={payment.pendingAmount}
                  />

                  <FormInputDate
                    label="Fecha de Depósito"
                    value={formData.receipt.depositDate}
                    onChange={e =>
                      handleDataChange('receipt', 'depositDate', e.target.value)
                    }
                    disabled={!canEdit}
                  />

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Archivo de Comprobante
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={e => handleFileChange('receipt', e)}
                        disabled={!canEdit}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          dark:file:bg-blue-900/20 dark:file:text-blue-400
                          dark:hover:file:bg-blue-900/30"
                      />
                      {formData.receipt.receiptImage && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                          ✓ Archivo seleccionado:{' '}
                          {formData.receipt.receiptImage?.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button onClick={closeAddPaymentModal}>Cancelar</Button>
                  <Button
                    onClick={handleSaveReceipt}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Pago'}
                  </Button>
                </div>
              </div>
            )}

            {/* Invoice Image Upload Form */}
            {currentStep === 'invoiceImage' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Subir Factura
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Archivo de Factura
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={e => handleFileChange('invoice', e)}
                      disabled={!canEdit}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        dark:file:bg-blue-900/20 dark:file:text-blue-400
                        dark:hover:file:bg-blue-900/30"
                    />
                    {formData.invoice.invoiceImage && (
                      <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                        ✓ Archivo seleccionado:{' '}
                        {formData.invoice.invoiceImage?.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button onClick={closeAddPaymentModal}>Cancelar</Button>
                  <Button
                    onClick={() => {
                      // Find the payment detail that needs invoice image
                      const paymentDetail = payment.paymentDetails.find(
                        d => d.paymentReceipt && !d.invoiceImage
                      );
                      if (paymentDetail) {
                        handleSaveInvoiceImage(paymentDetail.id);
                      }
                    }}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? 'Subiendo...' : 'Subir Documento'}
                  </Button>
                </div>
              </div>
            )}

            {/* Invoice Data Form */}
            {currentStep === 'invoiceData' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Información de la Factura
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInputDate
                    label="Fecha de Emisión de Factura"
                    value={formData.invoice.invoiceEmissionDate}
                    onChange={e =>
                      handleDataChange(
                        'invoice',
                        'invoiceEmissionDate',
                        e.target.value
                      )
                    }
                    disabled={!canEdit}
                  />

                  <FormInput
                    label="Número de Documento"
                    value={formData.invoice.documentNumber}
                    onChange={e =>
                      handleDataChange(
                        'invoice',
                        'documentNumber',
                        e.target.value
                      )
                    }
                    placeholder="Número de factura"
                    disabled={!canEdit}
                  />

                  <FormText
                    label="Descripción"
                    value={formData.invoice.description}
                    onChange={e =>
                      handleDataChange('invoice', 'description', e.target.value)
                    }
                    placeholder="Descripción del pago"
                    disabled={!canEdit}
                    rows={3}
                  />

                  <FormInput
                    label="Monto de Retención"
                    type="number"
                    step="0.01"
                    value={formData.invoice.retentionAmount}
                    onChange={e =>
                      handleDataChange(
                        'invoice',
                        'retentionAmount',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    disabled={!canEdit}
                  />

                  <FormInput
                    label="Porcentaje de Retención (%)"
                    type="number"
                    step="0.01"
                    value={formData.invoice.retentionPercentage}
                    onChange={e =>
                      handleDataChange(
                        'invoice',
                        'retentionPercentage',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    disabled={!canEdit}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button onClick={closeAddPaymentModal}>Cancelar</Button>
                  <Button
                    onClick={() => {
                      // Find the payment detail that needs invoice data
                      const paymentDetail = payment.paymentDetails.find(
                        d => d.invoiceImage && !d.documentNumber
                      );
                      if (paymentDetail) {
                        handleSaveInvoiceData(paymentDetail.id);
                      }
                    }}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Datos'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`🏢 ${payment.purchaseOrder.supplier?.businessName ?? ''}`}
      >
        {payment.purchaseOrder.supplier && (
          <SupplierDetails supplier={payment.purchaseOrder.supplier} />
        )}
      </Modal>
    </div>
  );
};
