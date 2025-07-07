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
import { PaymentStatus } from '../../../types/payment';
import type {
  PaymentGroup,
  FinalSelectionItem,
  PaymentDetail,
} from '../../../types/payment';
import type { CreatePaymentDetailDto } from '../../../types/payment';

export const PaymentForm: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const {
    getPaymentGroup,
    loading,
    createPaymentDetail,
    updatePaymentDetailReceipt,
    updatePaymentDetailInvoice,
  } = usePaymentService();

  const [payment, setPayment] = useState<PaymentGroup | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSupplierIndex, setSelectedSupplierIndex] = useState(0);
  const [currentTab, setCurrentTab] = useState<'receipt' | 'invoice'>(
    'receipt'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data for each supplier
  const [supplierData, setSupplierData] = useState<{
    [supplierId: number]: {
      receipt: {
        paymentReceipt: string;
        amount: number;
        depositDate: string;
        movementNumber: string;
        receiptImage: File | null;
        receiptImagePreview?: string;
      };
      invoice: {
        invoiceEmissionDate: string;
        documentNumber: string;
        description: string;
        retentionAmount: number;
        retentionPercentage: number;
        hasRetention: boolean;
        invoiceImage: File | null;
        invoiceImagePreview?: string;
      };
    };
  }>({});

  useEffect(() => {
    const loadPayment = async () => {
      if (params.id) {
        const result = await getPaymentGroup(Number(params.id));
        if (result) {
          setPayment(result);
        }
      }
    };
    loadPayment();
  }, [params.id, getPaymentGroup]);

  // Initialize supplier data after payment is loaded and grouped suppliers are calculated
  useEffect(() => {
    if (payment?.quotationRequest.finalSelection?.finalSelectionItems) {
      const today = new Date().toISOString().split('T')[0];
      const initialData: typeof supplierData = {};

      // Calculate pending amounts for each supplier
      const supplierPendingAmounts: { [supplierId: number]: number } = {};

      // First, calculate total amounts per supplier
      payment.quotationRequest.finalSelection.finalSelectionItems.forEach(
        item => {
          const supplierId = item.supplier.id;
          if (!supplierPendingAmounts[supplierId]) {
            supplierPendingAmounts[supplierId] = 0;
          }
          supplierPendingAmounts[supplierId] += Number(item.totalPrice) || 0;
        }
      );

      // Then subtract existing payments
      if (payment.paymentDetails) {
        payment.paymentDetails.forEach(paymentDetail => {
          if (paymentDetail.supplier?.id) {
            const supplierId = paymentDetail.supplier.id;
            if (supplierPendingAmounts[supplierId] !== undefined) {
              supplierPendingAmounts[supplierId] -=
                Number(paymentDetail.amount) || 0;
            }
          }
        });
      }

      // Initialize supplier data with correct pending amounts
      payment.quotationRequest.finalSelection.finalSelectionItems.forEach(
        item => {
          const supplierId = item.supplier.id;
          const pendingAmount = Math.max(
            0,
            supplierPendingAmounts[supplierId] || 0
          );

          initialData[supplierId] = {
            receipt: {
              paymentReceipt: '',
              amount: pendingAmount > 0 ? pendingAmount : 0,
              depositDate: today,
              movementNumber: '',
              receiptImage: null,
              receiptImagePreview: undefined,
            },
            invoice: {
              invoiceEmissionDate: '',
              documentNumber: '',
              description: '',
              retentionAmount: 0,
              retentionPercentage: 3.0,
              hasRetention: false,
              invoiceImage: null,
              invoiceImagePreview: undefined,
            },
          };
        }
      );
      setSupplierData(initialData);
    }
  }, [payment]);

  const suppliers =
    payment?.quotationRequest.finalSelection?.finalSelectionItems || [];

  // Group suppliers by ID and calculate total amounts
  const groupedSuppliers = suppliers.reduce(
    (acc, item) => {
      const supplierId = item.supplier.id;
      if (!acc[supplierId]) {
        acc[supplierId] = {
          supplier: item.supplier,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          items: [],
          hasPayment: false,
          paymentStatus: 'PENDING' as 'PENDING' | 'PARTIAL' | 'COMPLETED',
        };
      }
      acc[supplierId].totalAmount += Number(item.totalPrice) || 0;
      acc[supplierId].items.push(item);
      return acc;
    },
    {} as {
      [supplierId: number]: {
        supplier: FinalSelectionItem['supplier'];
        totalAmount: number;
        paidAmount: number;
        pendingAmount: number;
        items: FinalSelectionItem[];
        hasPayment: boolean;
        paymentStatus: 'PENDING' | 'PARTIAL' | 'COMPLETED';
      };
    }
  );

  // Check if payments exist for each supplier and calculate amounts
  if (payment?.paymentDetails) {
    payment.paymentDetails.forEach(paymentDetail => {
      // Check if this payment detail is for a specific supplier
      if (paymentDetail.supplier?.id) {
        const supplierGroup = groupedSuppliers[paymentDetail.supplier.id];
        if (supplierGroup) {
          supplierGroup.hasPayment = true;
          supplierGroup.paidAmount += Number(paymentDetail.amount) || 0;
          // Calculate pending amount
          supplierGroup.pendingAmount =
            supplierGroup.totalAmount - supplierGroup.paidAmount;

          // Determine payment status
          if (supplierGroup.paidAmount >= supplierGroup.totalAmount) {
            supplierGroup.paymentStatus = 'COMPLETED';
          } else if (supplierGroup.paidAmount > 0) {
            supplierGroup.paymentStatus = 'PARTIAL';
          } else {
            supplierGroup.paymentStatus = 'PENDING';
          }
        }
      }
    });
  }

  // For suppliers without payments, set pending amount equal to total amount
  Object.values(groupedSuppliers).forEach(supplierGroup => {
    if (!supplierGroup.hasPayment) {
      supplierGroup.pendingAmount = supplierGroup.totalAmount;
    }
  });

  const supplierList = Object.values(groupedSuppliers);
  const currentSupplier = supplierList[selectedSupplierIndex];

  const handleSupplierDataChange = (
    supplierId: number,
    type: 'receipt' | 'invoice',
    field: string,
    value: string | number | boolean | File | null
  ) => {
    setSupplierData(prev => ({
      ...prev,
      [supplierId]: {
        ...prev[supplierId],
        [type]: {
          ...prev[supplierId]?.[type],
          [field]: value,
        },
      },
    }));
  };

  const handleFileChange = (
    supplierId: number,
    type: 'receipt' | 'invoice',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;

    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      handleSupplierDataChange(supplierId, type, `${type}Image`, file);
      handleSupplierDataChange(
        supplierId,
        type,
        `${type}ImagePreview`,
        previewUrl
      );
    } else {
      handleSupplierDataChange(supplierId, type, `${type}Image`, null);
      handleSupplierDataChange(supplierId, type, `${type}ImagePreview`, '');
    }
  };

  const handleSupplierClick = (index: number) => {
    setSelectedSupplierIndex(index);
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveReceipt = async () => {
    if (!payment || !currentSupplier) return;

    const supplierId = currentSupplier.supplier.id;
    const supplierDataForSupplier = supplierData[supplierId];

    if (!supplierDataForSupplier) {
      showError('Error', 'No se encontraron datos del proveedor');
      return;
    }

    // Validate required fields
    if (!supplierDataForSupplier.receipt.receiptImage) {
      showError('Error', 'La imagen del comprobante de pago es obligatoria');
      return;
    }

    if (!supplierDataForSupplier.receipt.paymentReceipt) {
      showError('Error', 'El número de comprobante es obligatorio');
      return;
    }

    if (!supplierDataForSupplier.receipt.depositDate) {
      showError('Error', 'La fecha de depósito es obligatoria');
      return;
    }

    if (!supplierDataForSupplier.receipt.movementNumber) {
      showError('Error', 'El número de movimiento bancario es obligatorio');
      return;
    }

    // Validate amount doesn't exceed pending amount
    const pendingAmount = currentSupplier.pendingAmount;
    const amountToPay = supplierDataForSupplier.receipt.amount;

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
      // Always create a new payment detail for additional payments
      const paymentDetailData: CreatePaymentDetailDto = {
        code: `PAY-${payment.code}-${supplierId}-${Date.now()}`, // Unique code
        amount: supplierDataForSupplier.receipt.amount,
        description: `Pago adicional para ${currentSupplier.supplier.businessName}`,
        paymentGroupId: payment.id,
        supplierId: supplierId,
      };

      const newPaymentDetail = await createPaymentDetail(paymentDetailData);

      if (newPaymentDetail) {
        // Update receipt information
        await updatePaymentDetailReceipt(
          newPaymentDetail.id,
          {
            paymentReceipt: supplierDataForSupplier.receipt.paymentReceipt,
            depositDate: supplierDataForSupplier.receipt.depositDate,
            movementNumber: supplierDataForSupplier.receipt.movementNumber,
            description: `Pago adicional para ${currentSupplier.supplier.businessName}`,
          },
          supplierDataForSupplier.receipt.receiptImage
        );

        showSuccess('Pago adicional registrado exitosamente');

        // Clear form data after successful save
        handleSupplierDataChange(supplierId, 'receipt', 'paymentReceipt', '');
        handleSupplierDataChange(supplierId, 'receipt', 'amount', 0);
        handleSupplierDataChange(
          supplierId,
          'receipt',
          'depositDate',
          new Date().toISOString().split('T')[0]
        );
        handleSupplierDataChange(supplierId, 'receipt', 'movementNumber', '');
        handleSupplierDataChange(supplierId, 'receipt', 'receiptImage', null);
        handleSupplierDataChange(
          supplierId,
          'receipt',
          'receiptImagePreview',
          ''
        );
      }

      // Reload payment data to get updated information
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

  const handleSaveInvoice = async () => {
    if (!payment || !currentSupplier) return;

    const supplierId = currentSupplier.supplier.id;
    const supplierDataForSupplier = supplierData[supplierId];

    if (!supplierDataForSupplier) {
      showError('Error', 'No se encontraron datos del proveedor');
      return;
    }

    // Validate required fields
    if (!supplierDataForSupplier.invoice.invoiceImage) {
      showError('Error', 'La imagen de la factura es obligatoria');
      return;
    }

    if (!supplierDataForSupplier.invoice.invoiceEmissionDate) {
      showError('Error', 'La fecha de emisión de la factura es obligatoria');
      return;
    }

    if (!supplierDataForSupplier.invoice.documentNumber) {
      showError('Error', 'El número de documento es obligatorio');
      return;
    }

    if (!supplierDataForSupplier.invoice.description) {
      showError('Error', 'La descripción es obligatoria');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find existing payment detail for this supplier
      const existingPaymentDetail = payment.paymentDetails?.find(
        detail => detail.supplier?.id === supplierId
      );

      if (existingPaymentDetail) {
        // Update invoice information
        const invoiceData = {
          invoiceEmissionDate:
            supplierDataForSupplier.invoice.invoiceEmissionDate,
          documentNumber: supplierDataForSupplier.invoice.documentNumber,
          description: supplierDataForSupplier.invoice.description,
        };

        await updatePaymentDetailInvoice(
          existingPaymentDetail.id,
          invoiceData,
          supplierDataForSupplier.invoice.invoiceImage
        );

        showSuccess('Información de la factura actualizada exitosamente');

        // Clear form data after successful save
        handleSupplierDataChange(
          supplierId,
          'invoice',
          'invoiceEmissionDate',
          ''
        );
        handleSupplierDataChange(supplierId, 'invoice', 'documentNumber', '');
        handleSupplierDataChange(supplierId, 'invoice', 'description', '');
        handleSupplierDataChange(supplierId, 'invoice', 'invoiceImage', null);
        handleSupplierDataChange(
          supplierId,
          'invoice',
          'invoiceImagePreview',
          ''
        );
      } else {
        showError(
          'Error',
          'Debe registrar primero un pago para este proveedor'
        );
      }

      // Reload payment data to get updated information
      const updatedPayment = await getPaymentGroup(payment.id);
      if (updatedPayment) {
        setPayment(updatedPayment);
      }
    } catch (error) {
      console.error('Error saving invoice data:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      showError('Error al guardar factura', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(supplierData).forEach(supplier => {
        if (supplier.receipt.receiptImagePreview) {
          URL.revokeObjectURL(supplier.receipt.receiptImagePreview);
        }
        if (supplier.invoice.invoiceImagePreview) {
          URL.revokeObjectURL(supplier.invoice.invoiceImagePreview);
        }
      });
    };
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!payment)
    return <div className="text-red-500">Grupo de pagos no encontrado</div>;

  const canEdit =
    payment.status === PaymentStatus.PENDING ||
    payment.status === PaymentStatus.PARTIAL;

  // --- NUEVO: Componente de acordeón simple para pagos anteriores ---
  const PaymentAccordion: React.FC<{
    paymentDetail: PaymentDetail;
    onSaveReceipt: (
      data: {
        paymentReceipt: string;
        depositDate: string;
        movementNumber: string;
        description: string;
      },
      file: File | undefined
    ) => Promise<void>;
    onSaveInvoice: (
      data: {
        invoiceEmissionDate: string;
        documentNumber: string;
        description: string;
      },
      file: File | undefined
    ) => Promise<void>;
    canEdit: boolean;
  }> = ({ paymentDetail, onSaveReceipt, onSaveInvoice, canEdit }) => {
    const { showError, showSuccess } = useToast();
    const [open, setOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState<'receipt' | 'invoice'>(
      'receipt'
    );
    // Estados locales para edición
    const [receipt, setReceipt] = useState({
      paymentReceipt: paymentDetail.paymentReceipt || '',
      depositDate: paymentDetail.depositDate
        ? String(paymentDetail.depositDate)
        : '',
      movementNumber: paymentDetail.movementNumber || '',
      description: paymentDetail.description || '',
      receiptImage: null as File | null,
      receiptImagePreview: paymentDetail.receiptImage || '',
    });
    const [invoice, setInvoice] = useState({
      invoiceEmissionDate: paymentDetail.invoiceEmissionDate
        ? String(paymentDetail.invoiceEmissionDate)
        : '',
      documentNumber: paymentDetail.documentNumber || '',
      description: paymentDetail.description || '',
      invoiceImage: null as File | null,
      invoiceImagePreview: paymentDetail.invoiceImage || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    // Preview para nuevas imágenes
    useEffect(() => {
      return () => {
        if (
          receipt.receiptImagePreview &&
          receipt.receiptImage instanceof File
        ) {
          URL.revokeObjectURL(receipt.receiptImagePreview);
        }
        if (
          invoice.invoiceImagePreview &&
          invoice.invoiceImage instanceof File
        ) {
          URL.revokeObjectURL(invoice.invoiceImagePreview);
        }
      };
    }, [receipt.receiptImagePreview, invoice.invoiceImagePreview]);

    const handleFileChange = (
      type: 'receipt' | 'invoice',
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0] || null;
      if (type === 'receipt') {
        setReceipt(prev => ({
          ...prev,
          receiptImage: file,
          receiptImagePreview: file ? URL.createObjectURL(file) : '',
        }));
      } else {
        setInvoice(prev => ({
          ...prev,
          invoiceImage: file,
          invoiceImagePreview: file ? URL.createObjectURL(file) : '',
        }));
      }
    };

    const handleSaveReceipt = async () => {
      // Validaciones
      if (!receipt.paymentReceipt)
        return showError('Error', 'El número de comprobante es obligatorio');
      if (!receipt.depositDate)
        return showError('Error', 'La fecha de depósito es obligatoria');
      if (!receipt.movementNumber)
        return showError(
          'Error',
          'El número de movimiento bancario es obligatorio'
        );
      setIsSaving(true);
      try {
        await onSaveReceipt(
          {
            paymentReceipt: receipt.paymentReceipt,
            depositDate: receipt.depositDate,
            movementNumber: receipt.movementNumber,
            description: receipt.description,
          },
          receipt.receiptImage || undefined
        );
        showSuccess('Recibo actualizado');
      } catch {
        showError('Error', 'No se pudo actualizar el recibo');
      } finally {
        setIsSaving(false);
      }
    };
    const handleSaveInvoice = async () => {
      if (!invoice.invoiceEmissionDate)
        return showError('Error', 'La fecha de emisión es obligatoria');
      if (!invoice.documentNumber)
        return showError('Error', 'El número de documento es obligatorio');
      if (!invoice.description)
        return showError('Error', 'La descripción es obligatoria');
      setIsSaving(true);
      try {
        await onSaveInvoice(
          {
            invoiceEmissionDate: invoice.invoiceEmissionDate,
            documentNumber: invoice.documentNumber,
            description: invoice.description,
          },
          invoice.invoiceImage || undefined
        );
        showSuccess('Factura actualizada');
      } catch {
        showError('Error', 'No se pudo actualizar la factura');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="mb-2 border rounded">
        <button
          type="button"
          className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-t focus:outline-none"
          onClick={() => setOpen(o => !o)}
        >
          <span>
            Pago S/ {(+paymentDetail.amount).toFixed(2)} -{' '}
            {paymentDetail.paymentReceipt || 'Sin comprobante'}
          </span>
          <span>{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className="p-4 bg-white dark:bg-gray-800 border-t">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Editar Pago
            </h4>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setCurrentTab('receipt')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    currentTab === 'receipt'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Boleta de Pago
                </button>
                <button
                  onClick={() => setCurrentTab('invoice')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    currentTab === 'invoice'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  Factura
                </button>
              </nav>
            </div>

            {/* Receipt Tab */}
            {currentTab === 'receipt' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Comprobante de Pago"
                    value={receipt.paymentReceipt}
                    onChange={e =>
                      setReceipt(r => ({
                        ...r,
                        paymentReceipt: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                  />
                  <FormInputDate
                    label="Fecha de Depósito"
                    value={receipt.depositDate}
                    onChange={e =>
                      setReceipt(r => ({
                        ...r,
                        depositDate: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                  />
                  <FormInput
                    label="Número de Movimiento Bancario"
                    value={receipt.movementNumber}
                    onChange={e =>
                      setReceipt(r => ({
                        ...r,
                        movementNumber: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                  />
                  <FormText
                    label="Descripción"
                    value={receipt.description}
                    onChange={e =>
                      setReceipt(r => ({ ...r, description: e.target.value }))
                    }
                    disabled={!canEdit}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Imagen del Comprobante
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileChange('receipt', e)}
                      disabled={!canEdit}
                    />
                    {receipt.receiptImagePreview && (
                      <img
                        src={receipt.receiptImagePreview}
                        alt="Comprobante"
                        className="max-h-32 mt-2 rounded"
                      />
                    )}
                  </div>
                </div>
                {canEdit && (
                  <Button
                    onClick={handleSaveReceipt}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Boleta'}
                  </Button>
                )}
              </div>
            )}

            {/* Invoice Tab */}
            {currentTab === 'invoice' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInputDate
                    label="Fecha de Emisión"
                    value={invoice.invoiceEmissionDate}
                    onChange={e =>
                      setInvoice(i => ({
                        ...i,
                        invoiceEmissionDate: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                  />
                  <FormInput
                    label="Número de Documento"
                    value={invoice.documentNumber}
                    onChange={e =>
                      setInvoice(i => ({
                        ...i,
                        documentNumber: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                  />
                  <FormText
                    label="Descripción"
                    value={invoice.description}
                    onChange={e =>
                      setInvoice(i => ({ ...i, description: e.target.value }))
                    }
                    disabled={!canEdit}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Imagen de la Factura
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileChange('invoice', e)}
                      disabled={!canEdit}
                    />
                    {invoice.invoiceImagePreview && (
                      <img
                        src={invoice.invoiceImagePreview}
                        alt="Factura"
                        className="max-h-32 mt-2 rounded"
                      />
                    )}
                  </div>
                </div>
                {canEdit && (
                  <Button
                    onClick={handleSaveInvoice}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Factura'}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  // --- FIN acordeón ---

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {params.id ? 'Editar Pagos' : 'Nuevos Pagos'}
            </h1>
            <h2 className="text-sm text-gray-600 dark:text-gray-400">
              {payment.code}
            </h2>
          </div>
        </div>
      </div>

      {/* General Information */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Información General
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cotización
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {payment.quotationRequest.code}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Monto Total a Pagar
            </label>
            <p className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
              S/ {(+payment.totalAmount).toFixed(2)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Proveedores
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {suppliers.length} proveedor{suppliers.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Supplier Selection */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Proveedores de la Selección Final
          </h3>

          {supplierList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplierList.map((item, index) => (
                <div
                  key={item.supplier.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSupplierIndex === index
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleSupplierClick(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.supplier.businessName}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.supplier.ruc}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Monto Total:
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        S/ {(+item.totalAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Pagado:
                      </span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        S/ {(+item.paidAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Pendiente:
                      </span>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        S/ {(+item.pendingAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Estado:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.paymentStatus === 'COMPLETED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : item.paymentStatus === 'PARTIAL'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {item.paymentStatus === 'COMPLETED'
                          ? '✅ Completado'
                          : item.paymentStatus === 'PARTIAL'
                            ? '⏳ Parcial'
                            : '⏳ Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No hay proveedores en la selección final
              </p>
            </div>
          )}

          <div className="flex justify-between space-x-3">
            <div className="flex space-x-2">
              <Button onClick={() => navigate(ROUTES.PAYMENTS)}>Volver</Button>
            </div>
            <Button
              onClick={handleNextStep}
              disabled={!canEdit || supplierList.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Payment Details for Selected Supplier */}
      {currentStep === 1 && currentSupplier && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Pagos para {currentSupplier.supplier.businessName}
            </h3>
          </div>

          {/* Supplier Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
              Información del Proveedor
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Proveedor
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {currentSupplier.supplier.businessName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  RUC
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {currentSupplier.supplier.ruc}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contacto
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {currentSupplier.supplier.contactPerson || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Teléfono
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {currentSupplier.supplier.phone || 'No especificado'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dirección
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {currentSupplier.supplier.address || 'No especificado'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monto Total
                </label>
                <p className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
                  S/ {(+currentSupplier.totalAmount).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pagado
                </label>
                <p className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
                  S/ {(+currentSupplier.paidAmount).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pendiente
                </label>
                <p className="mt-1 text-lg font-semibold text-orange-600 dark:text-orange-400">
                  S/ {(+currentSupplier.pendingAmount).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado
                </label>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    currentSupplier.paymentStatus === 'COMPLETED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : currentSupplier.paymentStatus === 'PARTIAL'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}
                >
                  {currentSupplier.paymentStatus === 'COMPLETED'
                    ? '✅ Completado'
                    : currentSupplier.paymentStatus === 'PARTIAL'
                      ? '⏳ Parcial'
                      : '⏳ Pendiente'}
                </span>
              </div>
            </div>
          </div>

          {/* Pagos anteriores colapsables */}
          {payment.paymentDetails?.filter(
            d => d.supplier?.id === currentSupplier.supplier.id
          ).length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-2">Pagos realizados</h4>
              {payment.paymentDetails
                .filter(d => d.supplier?.id === currentSupplier.supplier.id)
                .map(detail => (
                  <PaymentAccordion
                    key={detail.id}
                    paymentDetail={detail}
                    canEdit={canEdit}
                    onSaveReceipt={async (data, file) => {
                      await updatePaymentDetailReceipt(detail.id, data, file);
                      // Recargar datos
                      const updatedPayment = await getPaymentGroup(payment.id);
                      if (updatedPayment) setPayment(updatedPayment);
                    }}
                    onSaveInvoice={async (data, file) => {
                      await updatePaymentDetailInvoice(detail.id, data, file);
                      // Recargar datos
                      const updatedPayment = await getPaymentGroup(payment.id);
                      if (updatedPayment) setPayment(updatedPayment);
                    }}
                  />
                ))}
            </div>
          )}

          {/* Formulario para agregar nuevo pago - solo si hay saldo pendiente */}
          {currentSupplier.pendingAmount > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Agregar Pago
              </h4>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setCurrentTab('receipt')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      currentTab === 'receipt'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    Boleta de Pago
                  </button>
                  <button
                    onClick={() => setCurrentTab('invoice')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      currentTab === 'invoice'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    Factura
                  </button>
                </nav>
              </div>

              {/* Receipt Tab */}
              {currentTab === 'receipt' && (
                <div className="space-y-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Información de la Boleta de Pago
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      id="paymentReceipt"
                      name="paymentReceipt"
                      label="Comprobante de Pago"
                      value={
                        supplierData[currentSupplier.supplier.id]?.receipt
                          .paymentReceipt || ''
                      }
                      onChange={e =>
                        handleSupplierDataChange(
                          currentSupplier.supplier.id,
                          'receipt',
                          'paymentReceipt',
                          e.target.value
                        )
                      }
                      placeholder="Número de comprobante"
                      disabled={!canEdit}
                    />

                    <FormInput
                      id="amount"
                      name="amount"
                      label="Monto a Pagar"
                      type="number"
                      step="0.01"
                      value={
                        supplierData[currentSupplier.supplier.id]?.receipt
                          .amount || 0
                      }
                      onChange={e => {
                        const newAmount = parseFloat(e.target.value) || 0;
                        const pendingAmount = currentSupplier.pendingAmount;
                        if (newAmount > pendingAmount) {
                          showError(
                            'Error',
                            `El monto no puede superar S/ ${pendingAmount.toFixed(2)}`
                          );
                          return;
                        }

                        handleSupplierDataChange(
                          currentSupplier.supplier.id,
                          'receipt',
                          'amount',
                          newAmount
                        );
                      }}
                      disabled={!canEdit}
                      max={currentSupplier.pendingAmount}
                    />
                    {supplierData[currentSupplier.supplier.id]?.receipt.amount >
                      currentSupplier.pendingAmount && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        ⚠️ El monto excede el pendiente (S/{' '}
                        {currentSupplier.pendingAmount.toFixed(2)})
                      </p>
                    )}

                    <FormInputDate
                      id="depositDate"
                      name="depositDate"
                      label="Fecha de Depósito"
                      value={
                        supplierData[currentSupplier.supplier.id]?.receipt
                          .depositDate || ''
                      }
                      onChange={e =>
                        handleSupplierDataChange(
                          currentSupplier.supplier.id,
                          'receipt',
                          'depositDate',
                          e.target.value
                        )
                      }
                      disabled={!canEdit}
                    />

                    <FormInput
                      id="movementNumber"
                      name="movementNumber"
                      label="Número de Movimiento Bancario"
                      value={
                        supplierData[currentSupplier.supplier.id]?.receipt
                          .movementNumber || ''
                      }
                      onChange={e =>
                        handleSupplierDataChange(
                          currentSupplier.supplier.id,
                          'receipt',
                          'movementNumber',
                          e.target.value
                        )
                      }
                      placeholder="Número de movimiento bancario"
                      disabled={!canEdit}
                    />

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Imagen del Comprobante
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e =>
                          handleFileChange(
                            currentSupplier.supplier.id,
                            'receipt',
                            e
                          )
                        }
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
                      {supplierData[currentSupplier.supplier.id]?.receipt
                        .receiptImage && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                          ✓ Archivo seleccionado:{' '}
                          {
                            supplierData[currentSupplier.supplier.id].receipt
                              .receiptImage?.name
                          }
                        </p>
                      )}
                    </div>

                    {/* Image Preview */}
                    {supplierData[currentSupplier.supplier.id]?.receipt
                      .receiptImagePreview && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Vista Previa
                        </label>
                        <div className="relative">
                          <img
                            src={
                              supplierData[currentSupplier.supplier.id].receipt
                                .receiptImagePreview
                            }
                            alt="Vista previa del comprobante"
                            className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleSupplierDataChange(
                                currentSupplier.supplier.id,
                                'receipt',
                                'receiptImage',
                                null
                              );
                              handleSupplierDataChange(
                                currentSupplier.supplier.id,
                                'receipt',
                                'receiptImagePreview',
                                ''
                              );
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            title="Eliminar imagen"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Invoice Tab */}
              {currentTab === 'invoice' && (
                <div className="space-y-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Información de la Factura
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInputDate
                      id="invoiceEmissionDate"
                      name="invoiceEmissionDate"
                      label="Fecha de Emisión de Factura"
                      value={
                        supplierData[currentSupplier.supplier.id]?.invoice
                          .invoiceEmissionDate || ''
                      }
                      onChange={e =>
                        handleSupplierDataChange(
                          currentSupplier.supplier.id,
                          'invoice',
                          'invoiceEmissionDate',
                          e.target.value
                        )
                      }
                      disabled={!canEdit}
                    />

                    <FormInput
                      id="documentNumber"
                      name="documentNumber"
                      label="Número de Documento"
                      value={
                        supplierData[currentSupplier.supplier.id]?.invoice
                          .documentNumber || ''
                      }
                      onChange={e =>
                        handleSupplierDataChange(
                          currentSupplier.supplier.id,
                          'invoice',
                          'documentNumber',
                          e.target.value
                        )
                      }
                      placeholder="Número de factura"
                      disabled={!canEdit}
                    />

                    <FormText
                      id="description"
                      name="description"
                      label="Descripción"
                      value={
                        supplierData[currentSupplier.supplier.id]?.invoice
                          .description || ''
                      }
                      onChange={e =>
                        handleSupplierDataChange(
                          currentSupplier.supplier.id,
                          'invoice',
                          'description',
                          e.target.value
                        )
                      }
                      placeholder="Descripción del pago"
                      disabled={!canEdit}
                      rows={3}
                    />

                    <FormInput
                      id="retentionAmount"
                      name="retentionAmount"
                      label="Monto de Retención"
                      type="number"
                      step="0.01"
                      value={
                        supplierData[currentSupplier.supplier.id]?.invoice
                          .retentionAmount || 0
                      }
                      onChange={e =>
                        handleSupplierDataChange(
                          currentSupplier.supplier.id,
                          'invoice',
                          'retentionAmount',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={!canEdit}
                    />

                    <FormInput
                      id="retentionPercentage"
                      name="retentionPercentage"
                      label="Porcentaje de Retención (%)"
                      type="number"
                      step="0.01"
                      value={
                        supplierData[currentSupplier.supplier.id]?.invoice
                          .retentionPercentage || 3.0
                      }
                      onChange={e =>
                        handleSupplierDataChange(
                          currentSupplier.supplier.id,
                          'invoice',
                          'retentionPercentage',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={!canEdit}
                    />

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Imagen de la Factura
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e =>
                          handleFileChange(
                            currentSupplier.supplier.id,
                            'invoice',
                            e
                          )
                        }
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
                      {supplierData[currentSupplier.supplier.id]?.invoice
                        .invoiceImage && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                          ✓ Archivo seleccionado:{' '}
                          {
                            supplierData[currentSupplier.supplier.id].invoice
                              .invoiceImage?.name
                          }
                        </p>
                      )}
                    </div>

                    {/* Image Preview */}
                    {supplierData[currentSupplier.supplier.id]?.invoice
                      .invoiceImagePreview && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Vista Previa
                        </label>
                        <div className="relative">
                          <img
                            src={
                              supplierData[currentSupplier.supplier.id].invoice
                                .invoiceImagePreview
                            }
                            alt="Vista previa de la factura"
                            className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleSupplierDataChange(
                                currentSupplier.supplier.id,
                                'invoice',
                                'invoiceImage',
                                null
                              );
                              handleSupplierDataChange(
                                currentSupplier.supplier.id,
                                'invoice',
                                'invoiceImagePreview',
                                ''
                              );
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            title="Eliminar imagen"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between space-x-3">
            <Button onClick={handlePreviousStep} variant="outline">
              Anterior
            </Button>

            <div className="flex space-x-3">
              {canEdit && currentTab === 'receipt' && (
                <>
                  <Button
                    onClick={handleSaveReceipt}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? 'Guardando...' : 'Agregar Pago'}
                  </Button>
                  <Button
                    onClick={() => {
                      const supplierId = currentSupplier.supplier.id;
                      handleSupplierDataChange(
                        supplierId,
                        'receipt',
                        'paymentReceipt',
                        ''
                      );
                      handleSupplierDataChange(
                        supplierId,
                        'receipt',
                        'amount',
                        0
                      );
                      handleSupplierDataChange(
                        supplierId,
                        'receipt',
                        'depositDate',
                        new Date().toISOString().split('T')[0]
                      );
                      handleSupplierDataChange(
                        supplierId,
                        'receipt',
                        'movementNumber',
                        ''
                      );
                      handleSupplierDataChange(
                        supplierId,
                        'receipt',
                        'receiptImage',
                        null
                      );
                      handleSupplierDataChange(
                        supplierId,
                        'receipt',
                        'receiptImagePreview',
                        ''
                      );
                    }}
                    variant="outline"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Limpiar Formulario
                  </Button>
                </>
              )}
              {canEdit && currentTab === 'invoice' && (
                <>
                  <Button
                    onClick={handleSaveInvoice}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? 'Guardando...' : 'Actualizar Factura'}
                  </Button>
                  <Button
                    onClick={() => {
                      const supplierId = currentSupplier.supplier.id;
                      handleSupplierDataChange(
                        supplierId,
                        'invoice',
                        'invoiceEmissionDate',
                        ''
                      );
                      handleSupplierDataChange(
                        supplierId,
                        'invoice',
                        'documentNumber',
                        ''
                      );
                      handleSupplierDataChange(
                        supplierId,
                        'invoice',
                        'description',
                        ''
                      );
                      handleSupplierDataChange(
                        supplierId,
                        'invoice',
                        'invoiceImage',
                        null
                      );
                      handleSupplierDataChange(
                        supplierId,
                        'invoice',
                        'invoiceImagePreview',
                        ''
                      );
                    }}
                    variant="outline"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Limpiar Formulario
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
