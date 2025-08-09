import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExitPart } from './hooks/useExitPart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { ExitPartStatus, InspectionStatus } from '../../types/exitPart';
import { ROUTES } from '../../config/constants';
import { useExitPartPdf } from './hooks/useExitPartPdf';

export const ExitPartDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: exitPart, isLoading, error } = useExitPart(parseInt(id!));
  const [localError, setLocalError] = useState<string | null>(null);
  const { downloadPdf, isDownloading } = useExitPartPdf();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !exitPart) {
    return (
      <div className="p-8">
        <ErrorBanner
          message="Error al cargar el parte de salida"
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

  return (
    <div className="mx-auto p-2">
      {localError && (
        <ErrorBanner message={localError} onClose={() => setLocalError(null)} />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detalle del Parte de Salida
        </h2>
        <div className="flex space-x-2">
          {exitPart.status === ExitPartStatus.PENDING && (
            <button
              onClick={() =>
                navigate(
                  ROUTES.EXIT_PART_EDIT_ARTICLES.replace(
                    ':id',
                    exitPart.id.toString()
                  )
                )
              }
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Editar
            </button>
          )}
          {exitPart.status === ExitPartStatus.COMPLETED && (
            <button
              onClick={() => downloadPdf(exitPart.id)}
              disabled={isDownloading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isDownloading ? 'Descargando...' : 'Descargar PDF'}
            </button>
          )}
          <button
            onClick={() => navigate(ROUTES.EXIT_PARTS_ARTICLES)}
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
              {exitPart.code}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                exitPart.status
              )}`}
            >
              {getStatusText(exitPart.status)}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Salida
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(exitPart.exitDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Empleado
            </label>
            <p className="text-gray-900 dark:text-white">
              {exitPart.employee ? (
                `${exitPart.employee.firstName} ${exitPart.employee.lastName}`
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
              {exitPart.warehouse?.name || 'No asignado'}
            </p>
          </div>
          {exitPart.purchaseOrder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Orden de Compra
              </label>
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
            </div>
          )}
        </div>

        {exitPart.observation && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observaciones
            </label>
            <p className="text-gray-900 dark:text-white">
              {exitPart.observation}
            </p>
          </div>
        )}

        {exitPart.imageUrl && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Imagen
            </label>
            <img
              src={exitPart.imageUrl}
              alt="Imagen del parte de salida"
              className="max-w-xs rounded-lg shadow-md"
            />
          </div>
        )}
      </div>

      {/* Mostrar artículos si hay artículos */}
      {exitPart.exitPartArticles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Artículos ({exitPart.exitPartArticles.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Entregado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Conforme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cert. Calidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Guía
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Inspección
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {exitPart.exitPartArticles.map(article => (
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {article.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {article.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {article.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {article.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {article.delivered}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {article.conform ? 'Sí' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {article.qualityCert ? 'Sí' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {article.guide ? 'Sí' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          article.inspection === InspectionStatus.ACCEPTED
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : article.inspection === InspectionStatus.REJECTED
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {article.inspection === InspectionStatus.ACCEPTED
                          ? 'Aceptado'
                          : article.inspection === InspectionStatus.REJECTED
                            ? 'Rechazado'
                            : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mostrar servicios si hay servicios */}
      {exitPart.exitPartServices.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Servicios ({exitPart.exitPartServices.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Recibido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Inspección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Observaciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {exitPart.exitPartServices.map(service => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {service.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {service.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {service.duration} {service.durationType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {service.received}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          service.inspection === InspectionStatus.ACCEPTED
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : service.inspection === InspectionStatus.REJECTED
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {service.inspection === InspectionStatus.ACCEPTED
                          ? 'Aceptado'
                          : service.inspection === InspectionStatus.REJECTED
                            ? 'Rechazado'
                            : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
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
