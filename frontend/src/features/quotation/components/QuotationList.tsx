import React, { useState, useEffect } from 'react';
import { useQuotationService } from '../../../hooks/useQuotationService';
import { quotationService } from '../../../services/api/quotationService';
import { useToast } from '../../../contexts/ToastContext';
import {
  getQuotationStatusColor,
  getQuotationStatusText,
} from '../../../utils/quotationUtils';
import type {
  QuotationRequest,
  QuotationFilters,
} from '../../../types/quotation';
import { Button } from '../../../components/common/Button';
import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../../components/common/Table';
import { Card } from '../../../components/ui/card';
import { Plus, Eye, Edit, Trash2, Download, UserCheck } from 'lucide-react';
import { FormSelect } from '../../../components/common/FormSelect';
import { FormInput } from '../../../components/common/FormInput';

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
  const { getQuotationRequests, deleteQuotationRequest, loading, error } =
    useQuotationService();
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

  const loadQuotations = async (page = 1) => {
    const result = await getQuotationRequests(page, pageSize, filters);
    if (result) {
      setQuotations(result.quotationRequests);
      setTotal(result.total);
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    loadQuotations(1);
  }, [filters]);

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

  const handleDownloadPdf = async (quotation: QuotationRequest) => {
    try {
      const blob = await quotationService.downloadQuotationComparisonPdf(
        quotation.id
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cuadro_comparativo_${quotation.code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Descargado', 'Cuadro comparativo descargado correctamente');
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      showError('Error', 'No se pudo descargar el cuadro comparativo');
    }
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
          <div className="font-medium">{quotation.requirement.code}</div>
          <div className="text-sm text-gray-500">
            {quotation.requirement.observation.substring(0, 50)}...
          </div>
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
      isHidden: (quotation: QuotationRequest) => quotation.status !== 'ACTIVE',
    },
    {
      icon: <UserCheck className="w-5 h-5 text-blue-600" />,
      label: 'Tomar Cotización',
      onClick: onEditQuotation,
      isHidden: (quotation: QuotationRequest) => quotation.status !== 'PENDING',
    },
    {
      icon: <Edit className="w-5 h-5 text-blue-600" />,
      label: 'Editar',
      onClick: onEditQuotation,
      isHidden: (quotation: QuotationRequest) => quotation.status !== 'DRAFT',
    },
    {
      icon: <Download className="w-5 h-5 text-blue-600" />,
      label: 'Descargar PDF',
      onClick: handleDownloadPdf,
      isHidden: (quotation: QuotationRequest) => quotation.status !== 'ACTIVE',
    },
    {
      icon: <Trash2 className="w-5 h-5 text-red-600" />,
      label: 'Reiniciar cotización',
      onClick: handleDelete,
      isHidden: (quotation: QuotationRequest) => quotation.status === 'PENDING',
    },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cotizaciones</h1>
        <Button onClick={onCreateQuotation} className="hidden">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cotización
        </Button>
      </div>

      <Card className="p-6">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  id="search"
                  name="search"
                  label="Buscar"
                  value={searchValue}
                  onChange={handleFilterChange}
                  placeholder="Buscar por código o requerimiento..."
                />
                <FormSelect
                  id="status"
                  name="status"
                  label="Estado"
                  value={filters.status || ''}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los estados</option>
                  <option value="PENDING">⏳ Pendiente</option>
                  <option value="DRAFT">📝 Borrador</option>
                  <option value="ACTIVE">🔄 Activo</option>
                  <option value="COMPLETED">✅ Completado</option>
                  <option value="CANCELLED">❌ Cancelado</option>
                </FormSelect>
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
