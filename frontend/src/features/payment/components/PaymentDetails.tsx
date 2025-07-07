import React, { useState, useEffect } from 'react';
import { usePaymentService } from '../../../hooks/usePaymentService';

import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import {
  getPaymentStatusLabel,
  getPaymentStatusColor,
  getPaymentDetailStatusText,
  getPaymentDetailStatusColor,
} from '../../../utils/paymentUtils';

import type { PaymentGroup } from '../../../types/payment';

export const PaymentDetails: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { getPaymentGroup, loading } = usePaymentService();

  const [payment, setPayment] = useState<PaymentGroup | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

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

  const handleImageClick = (src: string, alt: string) => {
    console.log('Image clicked:', src, alt);
    setSelectedImage({ src, alt });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (loading) return <LoadingSpinner />;
  if (!payment)
    return <div className="text-red-500">Grupo de pagos no encontrado</div>;

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
            <Button onClick={() => navigate(ROUTES.PAYMENTS)} variant="outline">
              Volver
            </Button>
            <Button
              onClick={() => navigate(`${ROUTES.PAYMENTS}/edit/${payment.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Editar
            </Button>
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
                Cotización Asociada
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {payment.quotationRequest.code}
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {payment.paymentDetails.map(detail => (
              <div
                key={detail.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                      {detail.code}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Proveedor: {detail.supplier.businessName}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentDetailStatusColor(
                      detail.status
                    )}`}
                  >
                    {getPaymentDetailStatusText(detail.status)}
                  </span>
                </div>

                {/* Amount */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    Monto
                  </label>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    S/ {(+detail.amount).toFixed(2)}
                  </p>
                </div>

                {/* Receipt Information */}
                {detail.paymentReceipt && (
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comprobante de Pago
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Número:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {detail.paymentReceipt}
                        </span>
                      </div>
                      {detail.depositDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Fecha:
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(detail.depositDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {detail.movementNumber && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Movimiento:
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {detail.movementNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Invoice Information */}
                {detail.documentNumber && (
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Factura
                    </h5>
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
                  </div>
                )}

                {/* Images Section */}
                <div className="space-y-3">
                  {/* Receipt Image */}
                  {detail.receiptImage && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Imagen del Comprobante
                      </h5>
                      <div className="relative group">
                        <img
                          src={detail.receiptImage}
                          alt="Comprobante de pago"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity z-10 relative"
                          onClick={() =>
                            detail.receiptImage &&
                            handleImageClick(
                              detail.receiptImage,
                              'Comprobante de pago'
                            )
                          }
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none z-20">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                            Click para ampliar
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Invoice Image */}
                  {detail.invoiceImage && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Imagen de la Factura
                      </h5>
                      <div className="relative group">
                        <img
                          src={detail.invoiceImage}
                          alt="Factura"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity z-10 relative"
                          onClick={() =>
                            detail.invoiceImage &&
                            handleImageClick(detail.invoiceImage, 'Factura')
                          }
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none z-20">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                            Click para ampliar
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Created by */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Creado por:
                      </span>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {detail.createdBy.firstName} {detail.createdBy.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Fecha:
                      </span>
                      <p className="text-xs text-gray-900 dark:text-white">
                        {new Date(detail.createdAt).toLocaleDateString()}
                      </p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Creado por
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {payment.createdBy.firstName} {payment.createdBy.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(payment.createdAt).toLocaleString()}
            </p>
          </div>
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

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-opacity z-10"
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
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
