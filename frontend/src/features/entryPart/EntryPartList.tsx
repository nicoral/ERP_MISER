import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useEntryParts,
  useGetEntryPartPdf,
  useGetEntryPartReceptionConformity,
} from './hooks/useEntryPart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { EntryPartStatus } from '../../types/entryPart';
import { ROUTES } from '../../config/constants';
import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../components/common/Table';
import { EyeIcon, EditIcon } from '../../components/common/Icons';
import { type EntryPart, EntryPartType } from '../../types/entryPart';
import { useToast } from '../../contexts/ToastContext';
import { FileIcon, Loader2 } from 'lucide-react';

export const EntryPartList = (props: { type?: EntryPartType }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useEntryParts(
    page,
    10,
    props.type || EntryPartType.ARTICLE
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const generatePdfReception = useGetEntryPartReceptionConformity();
  const generatePdfEntryPart = useGetEntryPartPdf();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const { showSuccess, showError } = useToast();

  const handleGetEntryPartPdf = async (entryPart: EntryPart) => {
    setDownloadingId(entryPart.id);
    try {
      const blob = await generatePdfEntryPart.mutateAsync(entryPart.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entryPart?.code}-parte-de-ingreso.pdf`;
      a.click();
      showSuccess('PDF generado correctamente');
    } catch (error) {
      console.error(error);
      showError('Error al generar el PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleGetReceptionConformity = async (entryPart: EntryPart) => {
    setDownloadingId(entryPart.id);
    try {
      const blob = await generatePdfReception.mutateAsync(entryPart.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entryPart?.code}-recepción-conformidad.pdf`;
      a.click();
      showSuccess('PDF generado correctamente');
    } catch (error) {
      console.error(error);
      showError('Error al generar el PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorBanner
          message="Error al cargar los partes de ingreso"
          onClose={() => setLocalError(null)}
        />
      </div>
    );
  }

  const getStatusColor = (status: EntryPartStatus) => {
    switch (status) {
      case EntryPartStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case EntryPartStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: EntryPartStatus) => {
    switch (status) {
      case EntryPartStatus.COMPLETED:
        return 'Completado';
      case EntryPartStatus.PENDING:
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  const handleView = (entryPart: EntryPart) => {
    if (props.type === EntryPartType.ARTICLE) {
      navigate(
        ROUTES.ENTRY_PART_DETAILS_ARTICLES.replace(
          ':id',
          entryPart.id.toString()
        )
      );
    } else {
      navigate(
        ROUTES.ENTRY_PART_DETAILS_SERVICES.replace(
          ':id',
          entryPart.id.toString()
        )
      );
    }
  };

  const handleEdit = (entryPart: EntryPart) => {
    if (props.type === EntryPartType.ARTICLE) {
      navigate(
        ROUTES.ENTRY_PART_EDIT_ARTICLES.replace(':id', entryPart.id.toString())
      );
    } else {
      navigate(
        ROUTES.ENTRY_PART_EDIT_SERVICES.replace(':id', entryPart.id.toString())
      );
    }
  };

  const columns: TableColumn<EntryPart>[] = [
    { header: 'Código', accessor: 'code' },
    {
      header: 'Fecha',
      accessor: 'entryDate',
      render: (entryPart: EntryPart) =>
        new Date(entryPart.entryDate).toLocaleDateString(),
    },
    {
      header: 'Recepcionado por',
      accessor: 'employee',
      render: (entryPart: EntryPart) =>
        `${entryPart.employee?.firstName ?? ''} ${entryPart.employee?.lastName ?? ''}`,
    },
    {
      header: 'Almacén',
      accessor: 'warehouse',
      render: (entryPart: EntryPart) =>
        entryPart.warehouse?.name || 'No asignado',
    },
    {
      header: 'Orden de Compra',
      accessor: 'purchaseOrder',
      render: (entryPart: EntryPart) =>
        entryPart.purchaseOrder?.code ? (
          <button
            onClick={() => {
              const url = ROUTES.PURCHASE_ORDER_DETAILS.replace(
                ':id',
                entryPart.purchaseOrder!.id.toString()
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
            {entryPart.purchaseOrder.code}
          </button>
        ) : (
          'No asignado'
        ),
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (entryPart: EntryPart) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            entryPart.status
          )}`}
        >
          {getStatusText(entryPart.status)}
        </span>
      ),
    },
  ];

  const actions: TableAction<EntryPart>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: 'Ver detalles',
      onClick: handleView,
    },
    {
      icon: (entryPart: EntryPart) =>
        downloadingId === entryPart.id ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-white" />
        ) : (
          <FileIcon className="w-5 h-5 text-blue-600" />
        ),
      label: 'Generar PDF de Conformidad',
      onClick: (entryPart: EntryPart) =>
        handleGetReceptionConformity(entryPart),
      disabled: (entryPart: EntryPart) => downloadingId === entryPart.id,
      isHidden: (entryPart: EntryPart) =>
        entryPart.status !== EntryPartStatus.COMPLETED,
    },
    {
      icon: (entryPart: EntryPart) =>
        downloadingId === entryPart.id ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-white" />
        ) : (
          <FileIcon className="w-5 h-5 text-blue-600" />
        ),
      label: 'Generar PDF de Parte de Ingreso',
      onClick: (entryPart: EntryPart) => handleGetEntryPartPdf(entryPart),
      disabled: (entryPart: EntryPart) => downloadingId === entryPart.id,
      isHidden: (entryPart: EntryPart) =>
        entryPart.status !== EntryPartStatus.COMPLETED,
    },
    {
      icon: <EditIcon className="w-5 h-5 text-blue-600" />,
      label: 'Editar',
      onClick: handleEdit,
      isHidden: (entryPart: EntryPart) =>
        entryPart.status !== EntryPartStatus.PENDING,
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
            ? 'Partes de Ingreso de Compras'
            : 'Partes de Ingreso de Servicios'}
        </h2>
        <button
          onClick={() =>
            navigate(
              props.type === EntryPartType.ARTICLE
                ? ROUTES.ENTRY_PART_CREATE_ARTICLES
                : ROUTES.ENTRY_PART_CREATE_SERVICES
            )
          }
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Nuevo Parte de Ingreso
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <Table<EntryPart>
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
