import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentService } from '../../../hooks/usePaymentService';
import { useToast } from '../../../contexts/ToastContext';
import {
  calculatePaymentProgress,
  getPaymentStatusText,
  getPaymentStatusColor,
} from '../../../utils/paymentUtils';
import { PaymentStatus } from '../../../types/payment';
import type { PaymentGroup, PaymentGroupFilters } from '../../../types/payment';
import { Button } from '../../../components/common/Button';
import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../../components/common/Table';
import { Card } from '../../../components/ui/card';
import { Plus, Eye } from 'lucide-react';
import { FormInput } from '../../../components/common/FormInput';
import { ROUTES } from '../../../config/constants';
import { hasPermission } from '../../../utils/permissions';

export const PaymentList: React.FC<{ type: 'ARTICLE' | 'SERVICE' }> = ({
  type,
}) => {
  const navigate = useNavigate();
  const { getPaymentGroups, getPaymentStatistics, loading } =
    usePaymentService();
  const { showSuccess, showError } = useToast();

  const [payments, setPayments] = useState<PaymentGroup[]>([]);
  const [filters, setFilters] = useState<PaymentGroupFilters>({});
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentGroup | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusStats, setStatusStats] = useState({
    PENDING: 0,
    APPROVED: 0,
    PARTIAL: 0,
    CANCELLED: 0,
    WITH_RECEIPT_NO_INVOICES: 0, // Nueva estadística
  });

  const isInitialMount = useRef(true);

  const loadStatistics = async () => {
    try {
      const stats = await getPaymentStatistics(type);
      if (stats) {
        setStatusStats(stats);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadPayments = async (page = 1) => {
    const result = await getPaymentGroups(type, page, pageSize, filters);
    if (result) {
      setPayments(result.data);
      setTotal(result.total);
      setCurrentPage(page);
    }
  };

  // Load payments when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Skip the first execution
    }
    loadPayments(1);
  }, [filters]);

  // Load statistics only on component mount
  useEffect(() => {
    loadStatistics();
  }, []);

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;

    setDeleting(true);
    try {
      // TODO: Implement delete payment group
      showSuccess(
        'Eliminado',
        `Grupo de pagos ${paymentToDelete.code} eliminado correctamente`
      );
      loadPayments(currentPage);
      // Reload statistics after successful deletion
      loadStatistics();
    } catch {
      showError('Error', 'No se pudo eliminar el grupo de pagos');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setPaymentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPaymentToDelete(null);
  };

  const handleViewPayment = (payment: PaymentGroup) => {
    navigate(
      type === 'ARTICLE'
        ? ROUTES.PAYMENT_ARTICLES_DETAILS.replace(':id', payment.id.toString())
        : ROUTES.PAYMENT_SERVICES_DETAILS.replace(':id', payment.id.toString())
    );
  };

  const handleCreatePayment = () => {
    // TODO: Implement payment creation if needed
    // For now, payments are created through quotation workflow
    console.log('Payment creation not implemented yet');
  };

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchValue }));
      setCurrentPage(1);
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setSearchValue(value);
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchValue('');
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: PaymentStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? undefined : status,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    loadPayments(page);
  };

  const columns: TableColumn<PaymentGroup>[] = [
    {
      header: 'ID',
      accessor: 'id',
    },
    {
      header: 'Código',
      accessor: 'code',
    },
    {
      header: 'Orden de Compra',
      render: (payment: PaymentGroup) => (
        <div>
          <button
            onClick={() => {
              const url = ROUTES.PURCHASE_ORDER_DETAILS.replace(
                ':id',
                payment.purchaseOrder.id.toString()
              );
              window.open(url, '_blank');
            }}
            className="bg-transparent text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors w-full"
          >
            <div className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">
              {payment.purchaseOrder.code}
            </div>
            <div className="text-sm text-gray-500">
              {payment.purchaseOrder.supplierName}
            </div>
          </button>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (payment: PaymentGroup) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
            payment.status
          )}`}
        >
          {getPaymentStatusText(payment.status)}
        </span>
      ),
    },
    {
      header: 'Monto Total',
      render: (payment: PaymentGroup) => (
        <div className="text-right">
          <div className="font-semibold">
            {new Intl.NumberFormat('es-PE', {
              style: 'currency',
              currency: 'PEN',
            }).format(payment.totalAmount)}
          </div>
          <div className="text-xs text-gray-500">
            Pagado:{' '}
            {new Intl.NumberFormat('es-PE', {
              style: 'currency',
              currency: 'PEN',
            }).format(payment.paidAmount)}
          </div>
        </div>
      ),
    },
    {
      header: 'Progreso',
      render: (payment: PaymentGroup) => {
        const progress = calculatePaymentProgress(
          payment.paidAmount,
          payment.totalAmount
        );
        const progressColor =
          progress === 100
            ? 'bg-green-500'
            : progress >= 60
              ? 'bg-blue-500'
              : progress >= 30
                ? 'bg-yellow-500'
                : 'bg-gray-500';

        return (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className={`h-2 rounded-full ${progressColor}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {progress}%
            </span>
          </div>
        );
      },
    },
  ];

  const actions: TableAction<PaymentGroup>[] = [
    ...(hasPermission('view_payments')
      ? [
          {
            icon: <Eye className="w-5 h-5 text-green-600" />,
            label: 'Ver detalles',
            onClick: handleViewPayment,
          },
        ]
      : []),
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="sm:p-8 p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:mb-6 mb-2">
        <h1 className="text-2xl font-bold">
          Grupos de Pagos {type === 'ARTICLE' ? 'de Compras' : 'de Servicios'}
        </h1>
        {hasPermission('create_payment') && (
          <Button onClick={handleCreatePayment} className="hidden">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Grupo de Pagos
          </Button>
        )}
      </div>

      <Card className="p-6">
        {/* Summary Statistics */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resumen de Grupos de Pagos
              </h2>
            </div>
            <button
              onClick={loadStatistics}
              className="bg-transparent text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Actualizar estadísticas"
            >
              🔄
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Pending */}
            <div
              onClick={() => handleStatusFilter(PaymentStatus.PENDING)}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === PaymentStatus.PENDING
                  ? 'bg-yellow-100 dark:bg-yellow-800 border-2 border-yellow-400 dark:border-yellow-600 shadow-lg'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Pendientes
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {statusStats.PENDING}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xl">
                    ⏳
                  </span>
                </div>
              </div>
            </div>

            {/* Partial */}
            <div
              onClick={() => handleStatusFilter(PaymentStatus.PARTIAL)}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === PaymentStatus.PARTIAL
                  ? 'bg-blue-100 dark:bg-blue-800 border-2 border-blue-400 dark:border-blue-600 shadow-lg'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Parciales
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statusStats.PARTIAL}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">
                    🔄
                  </span>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div
              onClick={() => handleStatusFilter(PaymentStatus.COMPLETED)}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === PaymentStatus.COMPLETED
                  ? 'bg-green-100 dark:bg-green-800 border-2 border-green-400 dark:border-green-600 shadow-lg'
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Completados
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {statusStats.APPROVED}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                  <span className="text-green-600 dark:text-green-400 text-xl">
                    ✅
                  </span>
                </div>
              </div>
            </div>

            {/* Cancelled */}
            <div
              onClick={() => handleStatusFilter(PaymentStatus.CANCELLED)}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === PaymentStatus.CANCELLED
                  ? 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 shadow-lg'
                  : 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Cancelados
                  </p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {statusStats.CANCELLED}
                  </p>
                </div>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <span className="text-gray-600 dark:text-gray-400 text-xl">
                    🚫
                  </span>
                </div>
              </div>
            </div>

            {/* With Receipt No Invoices */}
            <div
              onClick={() => {
                // Filtrar por PaymentDetails con comprobante pero sin facturas
                setFilters(prev => ({
                  ...prev,
                  hasReceiptNoInvoices: prev.hasReceiptNoInvoices
                    ? undefined
                    : true,
                }));
                setCurrentPage(1);
              }}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.hasReceiptNoInvoices
                  ? 'bg-purple-100 dark:bg-purple-800 border-2 border-purple-400 dark:border-purple-600 shadow-lg'
                  : 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Con Recibo Sin Facturas
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {statusStats.WITH_RECEIPT_NO_INVOICES}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">
                    📄
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex justify-between w-full text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md"
          >
            <span>Filtros</span>
            <svg
              className={`w-5 h-5 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <FormInput
                  id="search"
                  name="search"
                  label="Buscar"
                  value={searchValue}
                  onChange={handleFilterChange}
                  placeholder="Buscar por código o cotización..."
                />
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <Button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <Table<PaymentGroup>
            columns={columns}
            data={payments}
            keyField="id"
            loading={loading}
            pagination={{
              page: currentPage,
              totalPages: totalPages,
              onPageChange: handlePageChange,
            }}
            actions={actions}
            pageSize={pageSize}
          />
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Total: {total} grupos de pagos
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && paymentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirmar Eliminación
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <strong>¡Atención!</strong> Estás a punto de eliminar el grupo de
              pagos{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {paymentToDelete.code}
              </span>
              .
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Esta acción es irreversible. ¿Estás seguro de que deseas
              continuar?
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={handleCancelDelete}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? '🔄 Eliminando...' : 'Sí, Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
