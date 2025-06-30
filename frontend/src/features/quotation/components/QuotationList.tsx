import React, { useState, useEffect } from 'react';
import { useQuotationService } from '../../../hooks/useQuotationService';
import { useToast } from '../../../contexts/ToastContext';
import {
  getQuotationStatusColor,
  getQuotationStatusText,
  formatDate,
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
import { Plus, Eye, Edit, Trash2, Pause } from 'lucide-react';
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
  const {
    getQuotationRequests,
    deleteQuotationRequest,
    cancelQuotationRequest,
    loading,
    error,
  } = useQuotationService();
  const { showSuccess, showError } = useToast();

  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [filters, setFilters] = useState<QuotationFilters>({});
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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

  const handleDelete = async (quotation: QuotationRequest) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar la cotización ${quotation.code}?`
      )
    ) {
      const success = await deleteQuotationRequest(quotation.id);
      if (success) {
        showSuccess(
          'Eliminado',
          `Cotización ${quotation.code} eliminada correctamente`
        );
        loadQuotations(currentPage);
      } else {
        showError('Error', error || 'No se pudo eliminar la cotización');
      }
    }
  };

  const handleCancel = async (quotation: QuotationRequest) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres cancelar la cotización ${quotation.code}?`
      )
    ) {
      const success = await cancelQuotationRequest(quotation.id);
      if (success) {
        showSuccess(
          'Cancelado',
          `Cotización ${quotation.code} cancelada correctamente`
        );
        loadQuotations(currentPage);
      } else {
        showError('Error', 'No se pudo cancelar la cotización');
      }
    }
  };

  const handleFilterChange = (key: keyof QuotationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
      header: 'Fecha Límite',
      render: (quotation: QuotationRequest) => (
        <span>
          {quotation.deadline ? formatDate(quotation.deadline) : 'No definida'}
        </span>
      ),
    },
    {
      header: 'Creado',
      render: (quotation: QuotationRequest) => (
        <span>{formatDate(quotation.createdAt)}</span>
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
      icon: <Edit className="w-5 h-5 text-blue-600" />,
      label: 'Editar',
      onClick: onEditQuotation,
      isHidden: (quotation: QuotationRequest) => quotation.status !== 'DRAFT',
    },
    {
      icon: <Pause className="w-5 h-5 text-yellow-600" />,
      label: 'Cancelar cotización',
      onClick: handleCancel,
      isHidden: (quotation: QuotationRequest) => quotation.status !== 'ACTIVE',
    },
    {
      icon: <Trash2 className="w-5 h-5 text-red-600" />,
      label: 'Eliminar cotización',
      onClick: handleDelete,
      isHidden: (quotation: QuotationRequest) => quotation.status !== 'DRAFT',
    },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cotizaciones</h1>
        <Button onClick={onCreateQuotation}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cotización
        </Button>
      </div>

      <Card className="p-6">
        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              id="search"
              name="search"
              label="Buscar"
              value={filters.search || ''}
              onChange={e => handleFilterChange('search', e.target.value)}
              placeholder="Buscar por código o requerimiento..."
            />
            <FormSelect
              id="status"
              name="status"
              label="Estado"
              value={filters.status || ''}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="DRAFT">📝 Borrador</option>
              <option value="ACTIVE">🔄 Activo</option>
              <option value="COMPLETED">✅ Completado</option>
              <option value="CANCELLED">❌ Cancelado</option>
            </FormSelect>
            <div className="flex items-end">
              <Button onClick={() => setFilters({})} className="w-full">
                Limpiar Filtros
              </Button>
            </div>
          </div>
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
    </div>
  );
};
