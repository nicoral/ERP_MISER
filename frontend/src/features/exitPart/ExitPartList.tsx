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
import { EntryPartType } from '../../types/entryPart';
import { useExitPartPdf } from './hooks/useExitPartPdf';
import { FileIcon, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const ExitPartList = (props: { type?: EntryPartType }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useExitParts(
    page,
    10,
    props.type || EntryPartType.ARTICLE
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const { downloadPdf } = useExitPartPdf();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const { showError } = useToast();
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
    if (props.type === EntryPartType.ARTICLE) {
      navigate(
        ROUTES.EXIT_PART_DETAILS_ARTICLES.replace(':id', exitPart.id.toString())
      );
    } else {
      navigate(
        ROUTES.EXIT_PART_DETAILS_SERVICES.replace(':id', exitPart.id.toString())
      );
    }
  };

  const handleEdit = (exitPart: ExitPart) => {
    if (props.type === EntryPartType.ARTICLE) {
      navigate(
        ROUTES.EXIT_PART_EDIT_ARTICLES.replace(':id', exitPart.id.toString())
      );
    } else {
      navigate(
        ROUTES.EXIT_PART_EDIT_SERVICES.replace(':id', exitPart.id.toString())
      );
    }
  };

  const handleDownloadPdf = async (exitPart: ExitPart) => {
    setDownloadingId(exitPart.id);
    try {
      await downloadPdf(exitPart.id);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      showError('Error', 'No se pudo descargar el PDF');
    } finally {
      setDownloadingId(null);
    }
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
    {
      icon: (exitPart: ExitPart) =>
        downloadingId === exitPart.id ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-white" />
        ) : (
          <FileIcon className="w-5 h-5 text-blue-600" />
        ),
      label: 'Generar PDF de Conformidad',
      onClick: (exitPart: ExitPart) => handleDownloadPdf(exitPart),
      disabled: (exitPart: ExitPart) => downloadingId === exitPart.id,
      isHidden: (exitPart: ExitPart) =>
        exitPart.status !== ExitPartStatus.COMPLETED,
    },
  ];

  return (
    <div className="mx-auto p-2">
      {localError && (
        <ErrorBanner message={localError} onClose={() => setLocalError(null)} />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {props.type === EntryPartType.ARTICLE
            ? 'Partes de Salida de Compras'
            : 'Partes de Salida de Servicios'}
        </h2>
        <button
          onClick={() =>
            navigate(
              props.type === EntryPartType.ARTICLE
                ? ROUTES.EXIT_PART_CREATE_ARTICLES
                : ROUTES.EXIT_PART_CREATE_SERVICES
            )
          }
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Nuevo Parte de Salida
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <Table<ExitPart>
          columns={columns}
          data={data?.data || []}
          keyField="id"
          loading={isLoading}
          actions={actions}
          pageSize={10}
          pagination={{
            page: page,
            totalPages: data?.totalPages ?? 1,
            onPageChange: setPage,
          }}
        />
      </div>
    </div>
  );
};
