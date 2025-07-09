import React, { useState, useEffect, useRef } from 'react';
import { useQuotationService } from '../../../hooks/useQuotationService';
import { useToast } from '../../../contexts/ToastContext';
import {
  getQuotationStatusColor,
  getQuotationStatusText,
} from '../../../utils/quotationUtils';
import type {
  QuotationRequest,
  QuotationFilters,
} from '../../../types/quotation';
import { QuotationRequestStatus } from '../../../types/quotation';
import { Button } from '../../../components/common/Button';
import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../../components/common/Table';
import { Card } from '../../../components/ui/card';
import { Plus, Eye, Edit, Trash2, UserCheck } from 'lucide-react';
import { FormInput } from '../../../components/common/FormInput';
import { ROUTES } from '../../../config/constants';

interface QuotationListProps {
  onViewQuotation: (quotation: QuotationRequest) => void;
  onEditQuotation: (quotation: QuotationRequest) => void;
  onCreateQuotation: () => void;
}

export const QuotationList: React.FC<QuotationListProps> = ({
  onViewQuotation,
  onEditQuotation,
  onCreateQuotation,
}) => {
  const {
    getQuotationRequests,
    deleteQuotationRequest,
    getQuotationStatistics,
    loading,
    error,
  } = useQuotationService();
  const { showSuccess, showError } = useToast();

  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [filters, setFilters] = useState<QuotationFilters>({});
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quotationToDelete, setQuotationToDelete] =
    useState<QuotationRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusStats, setStatusStats] = useState({
    PENDING: 0,
    DRAFT: 0,
    ACTIVE: 0,
    CANCELLED: 0,
    SIGNED_1: 0,
    SIGNED_2: 0,
    SIGNED_3: 0,
    APPROVED: 0,
    REJECTED: 0,
  });

  const isInitialMount = useRef(true);

  const loadStatistics = async () => {
    try {
      const stats = await getQuotationStatistics();
      if (stats) {
        setStatusStats(stats);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadQuotations = async (page = 1) => {
    const result = await getQuotationRequests(page, pageSize, filters);
    if (result) {
      setQuotations(result.quotationRequests);
      setTotal(result.total);
      setCurrentPage(page);
    }
  };

  // Load quotations when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Skip the first execution
    }
    loadQuotations(1);
  }, [filters]);

  // Load statistics only on component mount
  useEffect(() => {
    loadStatistics();
  }, []);

  const handleDelete = (quotation: QuotationRequest) => {
    setQuotationToDelete(quotation);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!quotationToDelete) return;

    setDeleting(true);
    try {
      const success = await deleteQuotationRequest(quotationToDelete.id);
      if (success) {
        showSuccess(
          'Reiniciada',
          `Cotización ${quotationToDelete.code} reiniciada correctamente`
        );
        loadQuotations(currentPage);
        // Reload statistics after successful deletion
        loadStatistics();
      } else {
        showError('Error', error || 'No se pudo reiniciar la cotización');
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setQuotationToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setQuotationToDelete(null);
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

  const handleStatusFilter = (status: QuotationRequestStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? undefined : status,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    loadQuotations(page);
  };

  const columns: TableColumn<QuotationRequest>[] = [
    {
      header: 'ID',
      accessor: 'id',
    },
    {
      header: 'Código',
      accessor: 'code',
    },
    {
      header: 'Requerimiento',
      render: (quotation: QuotationRequest) => (
        <div>
          <button
            onClick={() => {
              const url = ROUTES.REQUIREMENTS_DETAILS.replace(
                ':id',
                quotation.requirement.id.toString()
              );
              window.open(url, '_blank');
            }}
            className="bg-transparent text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors w-full"
          >
            <div className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">
              {quotation.requirement.code}
            </div>
            <div className="text-sm text-gray-500">
              {quotation.requirement.observation.length > 12
                ? quotation.requirement.observation.substring(0, 12) + '...'
                : quotation.requirement.observation}
            </div>
          </button>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (quotation: QuotationRequest) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getQuotationStatusColor(
            quotation.status
          )}`}
        >
          {getQuotationStatusText(quotation.status)}
        </span>
      ),
    },
    {
      header: 'Progreso',
      render: (quotation: QuotationRequest) => {
        const progress = quotation.progress;
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
              {Math.round(progress)}%
            </span>
          </div>
        );
      },
    },
    {
      header: 'Asignado a',
      render: (quotation: QuotationRequest) =>
        quotation.createdBy ? (
          <span>
            {quotation.createdBy?.firstName} {quotation.createdBy?.lastName}
          </span>
        ) : (
          <span>No asignado</span>
        ),
    },
  ];

  const actions: TableAction<QuotationRequest>[] = [
    {
      icon: <Eye className="w-5 h-5 text-green-600" />,
      label: 'Ver detalles',
      onClick: onViewQuotation,
      isHidden: (quotation: QuotationRequest) =>
        quotation.status === 'PENDING' || quotation.status === 'DRAFT',
    },
    {
      icon: <UserCheck className="w-5 h-5 text-blue-600" />,
      label: 'Tomar Cotización',
      onClick: onEditQuotation,
      isHidden: (quotation: QuotationRequest) => quotation.createdBy !== null,
    },
    {
      icon: <Edit className="w-5 h-5 text-blue-600" />,
      label: 'Editar',
      onClick: onEditQuotation,
      isHidden: (quotation: QuotationRequest) =>
        quotation.status !== 'DRAFT' &&
        quotation.status !== 'PENDING' &&
        quotation.status !== 'CANCELLED',
    },
    {
      icon: <Trash2 className="w-5 h-5 text-red-600" />,
      label: 'Reiniciar cotización',
      onClick: handleDelete,
      isHidden: (quotation: QuotationRequest) => quotation.status !== 'DRAFT',
    },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 sm:px-8 p-2">
      <div className="flex justify-between items-center sm:mb-6 mb-2">
        <h1 className="text-2xl font-bold">Cotizaciones</h1>
        <Button onClick={onCreateQuotation} className="hidden">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cotización
        </Button>
      </div>

      <Card className="p-6">
        {/* Summary Statistics */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resumen de Cotizaciones
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
          <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-4 gap-4">
            {/* Pending */}
            <div
              onClick={() => handleStatusFilter(QuotationRequestStatus.PENDING)}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === QuotationRequestStatus.PENDING
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

            {/* Draft */}
            <div
              onClick={() => handleStatusFilter(QuotationRequestStatus.DRAFT)}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === QuotationRequestStatus.DRAFT
                  ? 'bg-blue-100 dark:bg-blue-800 border-2 border-blue-400 dark:border-blue-600 shadow-lg'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Borradores
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statusStats.DRAFT}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">
                    📝
                  </span>
                </div>
              </div>
            </div>

            {/* Active */}
            <div
              onClick={() => handleStatusFilter(QuotationRequestStatus.ACTIVE)}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === QuotationRequestStatus.ACTIVE
                  ? 'bg-purple-100 dark:bg-purple-800 border-2 border-purple-400 dark:border-purple-600 shadow-lg'
                  : 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Activas
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {statusStats.ACTIVE}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">
                    🔄
                  </span>
                </div>
              </div>
            </div>

            {/* Approved */}
            <div
              onClick={() =>
                handleStatusFilter(QuotationRequestStatus.APPROVED)
              }
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === QuotationRequestStatus.APPROVED
                  ? 'bg-green-100 dark:bg-green-800 border-2 border-green-400 dark:border-green-600 shadow-lg'
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Aprobadas
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

            {/* Signed 1 */}
            <div
              onClick={() =>
                handleStatusFilter(QuotationRequestStatus.SIGNED_1)
              }
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === QuotationRequestStatus.SIGNED_1
                  ? 'bg-orange-100 dark:bg-orange-800 border-2 border-orange-400 dark:border-orange-600 shadow-lg'
                  : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Firmado (Logística)
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {statusStats.SIGNED_1}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full">
                  <span className="text-orange-600 dark:text-orange-400 text-xl">
                    ✍️
                  </span>
                </div>
              </div>
            </div>

            {/* Signed 2 */}
            <div
              onClick={() =>
                handleStatusFilter(QuotationRequestStatus.SIGNED_2)
              }
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === QuotationRequestStatus.SIGNED_2
                  ? 'bg-orange-100 dark:bg-orange-800 border-2 border-orange-400 dark:border-orange-600 shadow-lg'
                  : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Firmado (Of. Técnica)
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {statusStats.SIGNED_2}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full">
                  <span className="text-orange-600 dark:text-orange-400 text-xl">
                    ✍️
                  </span>
                </div>
              </div>
            </div>

            {/* Signed 3 */}
            <div
              onClick={() =>
                handleStatusFilter(QuotationRequestStatus.SIGNED_3)
              }
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === QuotationRequestStatus.SIGNED_3
                  ? 'bg-orange-100 dark:bg-orange-800 border-2 border-orange-400 dark:border-orange-600 shadow-lg'
                  : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Firmado (Administración)
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {statusStats.SIGNED_3}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full">
                  <span className="text-orange-600 dark:text-orange-400 text-xl">
                    ✍️
                  </span>
                </div>
              </div>
            </div>

            {/* Rejected */}
            <div
              onClick={() =>
                handleStatusFilter(QuotationRequestStatus.REJECTED)
              }
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === QuotationRequestStatus.REJECTED
                  ? 'bg-red-100 dark:bg-red-800 border-2 border-red-400 dark:border-red-600 shadow-lg'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Rechazadas
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {statusStats.REJECTED}
                  </p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-800 rounded-full">
                  <span className="text-red-600 dark:text-red-400 text-xl">
                    ❌
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
                  placeholder="Buscar por código o requerimiento..."
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
          <Table<QuotationRequest>
            columns={columns}
            data={quotations}
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
          Total: {total} cotizaciones
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && quotationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirmar Reinicio
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <strong>¡Atención!</strong> Estás a punto de reiniciar la
              cotización{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {quotationToDelete.code}
              </span>
              .
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Esta acción eliminará todos los datos avanzados (órdenes enviadas,
              cotizaciones recibidas, comparaciones y selección final) y pondrá
              la cotización en estado pendiente. Esta acción es irreversible.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas continuar?
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
                {deleting ? '🔄 Reiniciando...' : 'Sí, Reiniciar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
