import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useEntryPart,
  useGetEntryPartPdf,
  useGetEntryPartReceptionConformity,
} from './hooks/useEntryPart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { EntryPartStatus, EntryPartType } from '../../types/entryPart';
import { ROUTES } from '../../config/constants';
import { useToast } from '../../contexts/ToastContext';

export const EntryPartDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { data: entryPart, isLoading, error } = useEntryPart(parseInt(id!));
  const [localError, setLocalError] = useState<string | null>(null);
  const generatePdfReception = useGetEntryPartReceptionConformity();
  const generatePdfEntryPart = useGetEntryPartPdf();
  const [loading, setLoading] = useState(false);

  const handleGetEntryPartPdf = async () => {
    setLoading(true);
    try {
      const blob = await generatePdfEntryPart.mutateAsync(parseInt(id!));
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
      setLoading(false);
    }
  };

  const handleGetReceptionConformity = async () => {
    setLoading(true);
    try {
      const blob = await generatePdfReception.mutateAsync(parseInt(id!));
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
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return <LoadingSpinner />;
  }

  if (error || !entryPart) {
    return (
      <div className="p-8">
        <ErrorBanner
          message="Error al cargar el parte de ingreso"
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

  return (
    <div className="mx-auto p-2">
      {localError && (
        <ErrorBanner message={localError} onClose={() => setLocalError(null)} />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detalle del Parte de Ingreso
        </h2>
        <div className="flex space-x-2">
          {entryPart.status === EntryPartStatus.PENDING && (
            <button
              onClick={() =>
                entryPart.type === EntryPartType.ARTICLE
                  ? navigate(
                      ROUTES.ENTRY_PART_EDIT_ARTICLES.replace(
                        ':id',
                        entryPart.id.toString()
                      )
                    )
                  : navigate(
                      ROUTES.ENTRY_PART_EDIT_SERVICES.replace(
                        ':id',
                        entryPart.id.toString()
                      )
                    )
              }
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Editar
            </button>
          )}
          {entryPart.status === EntryPartStatus.COMPLETED && (
            <>
              <button
                onClick={handleGetReceptionConformity}
                className="px-4 py-2 text-sm font-medium text-white-700 dark:text-white-300 bg-blue-600 dark:bg-blue-700 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Generar PDF de Conformidad
              </button>
              <button
                onClick={handleGetEntryPartPdf}
                className="px-4 py-2 text-sm font-medium text-white-700 dark:text-white-300 bg-blue-600 dark:bg-blue-700 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Generar PDF de Parte de Ingreso
              </button>
            </>
          )}
          <button
            onClick={() =>
              entryPart.type === EntryPartType.ARTICLE
                ? navigate(ROUTES.ENTRY_PARTS_ARTICLES)
                : navigate(ROUTES.ENTRY_PARTS_SERVICES)
            }
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código
            </label>
            <p className="text-gray-900 dark:text-white font-medium">
              {entryPart.code}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                entryPart.status
              )}`}
            >
              {getStatusText(entryPart.status)}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Ingreso
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(entryPart.entryDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Empleado
            </label>
            <p className="text-gray-900 dark:text-white">
              {entryPart.employee ? (
                `${entryPart.employee.firstName} ${entryPart.employee.lastName}`
              ) : (
                <span className="text-gray-500 dark:text-gray-400">
                  No asignado
                </span>
              )}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Almacén
            </label>
            <p className="text-gray-900 dark:text-white">
              {entryPart.warehouse?.name || 'No asignado'}
            </p>
          </div>
          {entryPart.purchaseOrder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Orden de Compra
              </label>
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
            </div>
          )}
        </div>

        {entryPart.observation && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observaciones
            </label>
            <p className="text-gray-900 dark:text-white">
              {entryPart.observation}
            </p>
          </div>
        )}

        {entryPart.imageUrl && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Imagen
            </label>
            <img
              src={entryPart.imageUrl}
              alt="Imagen del parte de ingreso"
              className="max-w-xs rounded-lg shadow-md"
            />
          </div>
        )}
      </div>

      {/* Mostrar artículos si el tipo es ARTICLE o si hay artículos */}
      {entryPart.type === EntryPartType.ARTICLE &&
        entryPart.entryPartArticles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Artículos ({entryPart.entryPartArticles.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      #
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Descripción
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      UND
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Cant. Esperada
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Cant. Recibida
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Conforme
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Cert. Calidad
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Guía Remisión
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Inspección
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {entryPart.entryPartArticles.map((article, idx) => (
                    <tr key={article.id}>
                      <td className="px-2 py-2 text-center">{idx + 1}</td>
                      <td className="px-2 py-2">{article.name}</td>
                      <td className="px-2 py-2">{article.unit}</td>
                      <td className="px-2 py-2 text-center">
                        {article.quantity}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {article.received}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            article.conform
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {article.conform ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            article.qualityCert
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {article.qualityCert ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            article.guide
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {article.guide ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            article.inspection === 'ACCEPTED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : article.inspection === 'REJECTED'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {article.inspection === 'ACCEPTED'
                            ? 'Aceptado'
                            : article.inspection === 'REJECTED'
                              ? 'Rechazado'
                              : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        {article.observation || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Mostrar servicios si el tipo es SERVICE o si hay servicios */}
      {entryPart.type === EntryPartType.SERVICE &&
        entryPart.entryPartServices.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Servicios ({entryPart.entryPartServices.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      #
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Descripción
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Duración
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Cant. Recibida
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Conforme
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Cert. Calidad
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Guía Remisión
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Inspección
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {entryPart.entryPartServices.map((service, idx) => (
                    <tr key={service.id}>
                      <td className="px-2 py-2 text-center">{idx + 1}</td>
                      <td className="px-2 py-2">{service.name}</td>
                      <td className="px-2 py-2">
                        {service.duration} {service.durationType}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {service.received}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            service.conform
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {service.conform ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            service.qualityCert
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {service.qualityCert ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            service.guide
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {service.guide ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            service.inspection === 'ACCEPTED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : service.inspection === 'REJECTED'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {service.inspection === 'ACCEPTED'
                            ? 'Aceptado'
                            : service.inspection === 'REJECTED'
                              ? 'Rechazado'
                              : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        {service.observation || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
};
