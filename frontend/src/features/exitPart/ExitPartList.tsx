import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExitParts } from './hooks/useExitPart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { ExitPartStatus } from '../../types/exitPart';
import { ROUTES } from '../../config/constants';
import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../components/common/Table';
import { EyeIcon, EditIcon } from '../../components/common/Icons';
import type { ExitPart } from '../../types/exitPart';

export const ExitPartList = () => {
  const navigate = useNavigate();
  const { data: exitParts, isLoading, error } = useExitParts();
  const [localError, setLocalError] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorBanner
          message="Error al cargar los partes de salida"
          onClose={() => setLocalError(null)}
        />
      </div>
    );
  }

  const getStatusColor = (status: ExitPartStatus) => {
    switch (status) {
      case ExitPartStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case ExitPartStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: ExitPartStatus) => {
    switch (status) {
      case ExitPartStatus.COMPLETED:
        return 'Completado';
      case ExitPartStatus.PENDING:
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const handleView = (exitPart: ExitPart) => {
    navigate(ROUTES.EXIT_PART_DETAILS.replace(':id', exitPart.id.toString()));
  };

  const handleEdit = (exitPart: ExitPart) => {
    navigate(ROUTES.EXIT_PART_EDIT.replace(':id', exitPart.id.toString()));
  };

  const columns: TableColumn<ExitPart>[] = [
    { header: 'Código', accessor: 'code' },
    {
      header: 'Fecha',
      accessor: 'exitDate',
      render: (exitPart: ExitPart) =>
        new Date(exitPart.exitDate).toLocaleDateString(),
    },
    {
      header: 'Entregado por',
      accessor: 'employee',
      render: (exitPart: ExitPart) =>
        `${exitPart.employee?.firstName ?? ''} ${exitPart.employee?.lastName ?? ''}`,
    },
    {
      header: 'Almacén',
      accessor: 'warehouse',
      render: (exitPart: ExitPart) => exitPart.warehouse?.name || 'No asignado',
    },
    {
      header: 'Orden de Compra',
      accessor: 'purchaseOrder',
      render: (exitPart: ExitPart) =>
        exitPart.purchaseOrder?.code ? (
          <button
            onClick={() => {
              const url = ROUTES.PURCHASE_ORDER_DETAILS.replace(
                ':id',
                exitPart.purchaseOrder!.id.toString()
              );
              window.open(url, '_blank');
            }}
            className="bg-gray-100 dark:bg-gray-700 rounded-md inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors"
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
            {exitPart.purchaseOrder.code}
          </button>
        ) : (
          'No asignado'
        ),
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (exitPart: ExitPart) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            exitPart.status
          )}`}
        >
          {getStatusText(exitPart.status)}
        </span>
      ),
    },
  ];

  const actions: TableAction<ExitPart>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: 'Ver detalles',
      onClick: handleView,
    },
    {
      icon: <EditIcon className="w-5 h-5 text-blue-600" />,
      label: 'Editar',
      onClick: handleEdit,
      isHidden: (exitPart: ExitPart) =>
        exitPart.status !== ExitPartStatus.PENDING,
    },
  ];

  return (
    <div className="mx-auto p-2">
      {localError && (
        <ErrorBanner message={localError} onClose={() => setLocalError(null)} />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Partes de Salida
        </h2>
        <button
          onClick={() => navigate(ROUTES.EXIT_PART_CREATE)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Nuevo Parte de Salida
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <Table<ExitPart>
          columns={columns}
          data={exitParts || []}
          keyField="id"
          loading={isLoading}
          actions={actions}
          pageSize={10}
        />
      </div>
    </div>
  );
};
