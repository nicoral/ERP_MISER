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
import { Table } from '../../../components/common/Table';
import { Card } from '../../../components/ui/card';
import { Plus, Eye, Edit, Trash2, Badge } from 'lucide-react';
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
    activateQuotationRequest,
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

  const handleDelete = async (id: number) => {
    if (
      window.confirm('¿Estás seguro de que quieres eliminar esta cotización?')
    ) {
      const success = await deleteQuotationRequest(id);
      console.log('success', success);
      if (success) {
        showSuccess('Eliminado', 'Cotización eliminada correctamente');
        loadQuotations(currentPage);
      } else {
        showError('Error', error || 'No se pudo eliminar la cotización');
      }
    }
  };

  const handleActivate = async (id: number) => {
    if (
      window.confirm('¿Estás seguro de que quieres activar esta cotización?')
    ) {
      const success = await activateQuotationRequest(id);
      if (success) {
        showSuccess('Activado', 'Cotización activada correctamente');
        loadQuotations(currentPage);
      } else {
        showError('Error', 'No se pudo activar la cotización');
      }
    }
  };

  const handleCancel = async (id: number) => {
    if (
      window.confirm('¿Estás seguro de que quieres cancelar esta cotización?')
    ) {
      const success = await cancelQuotationRequest(id);
      if (success) {
        showSuccess('Cancelado', 'Cotización cancelada correctamente');
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

  const columns = [
    {
      key: 'code',
      header: 'Código',
      render: (quotation: QuotationRequest) => (
        <span className="font-medium">{quotation.code}</span>
      ),
    },
    {
      key: 'requirement',
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
      key: 'status',
      header: 'Estado',
      render: (quotation: QuotationRequest) => (
        <Badge className={getQuotationStatusColor(quotation.status)}>
          {getQuotationStatusText(quotation.status)}
        </Badge>
      ),
    },
    {
      key: 'suppliers',
      header: 'Proveedores',
      render: (quotation: QuotationRequest) => (
        <span>{quotation.quotationSuppliers.length} proveedores</span>
      ),
    },
    {
      key: 'deadline',
      header: 'Fecha Límite',
      render: (quotation: QuotationRequest) => (
        <span>
          {quotation.deadline ? formatDate(quotation.deadline) : 'No definida'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Creado',
      render: (quotation: QuotationRequest) => (
        <span>{formatDate(quotation.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (quotation: QuotationRequest) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onViewQuotation(quotation)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => onEditQuotation(quotation)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          {quotation.status === 'DRAFT' && (
            <Button
              variant="outline"
              onClick={() => handleActivate(quotation.id)}
              className="text-green-600 hover:text-green-700"
              title="Activar"
            >
              ✓
            </Button>
          )}
          {quotation.status === 'ACTIVE' && (
            <Button
              variant="outline"
              onClick={() => handleCancel(quotation.id)}
              className="text-yellow-600 hover:text-yellow-700"
              title="Cancelar"
            >
              ⏸
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleDelete(quotation.id)}
            className="text-red-600 hover:text-red-700"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
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
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <FormInput
              label="Buscar"
              name="search"
              placeholder="Buscar cotizaciones..."
              value={filters.search || ''}
              onChange={value =>
                handleFilterChange('search', value.target.value)
              }
            />
          </div>
          <div className="w-48">
            <FormSelect
              label="Estado"
              name="status"
              value={filters.status || ''}
              onChange={value =>
                handleFilterChange('status', value.target.value)
              }
            >
              <option value="">Todos los estados</option>
              <option value="DRAFT">Borrador</option>
              <option value="ACTIVE">Activo</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </FormSelect>
          </div>
        </div>

        <Table<QuotationRequest>
          columns={columns}
          data={quotations}
          keyField="id"
          loading={loading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
              {Math.min(currentPage * pageSize, total)} de {total} cotizaciones
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-sm"
              >
                Anterior
              </Button>
              <span className="px-3 py-2 text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-sm"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Total: {total} cotizaciones
        </div>
      </Card>
    </div>
  );
};
