import { useRequirementService } from '../hooks/useRequirements';
import { formatDate } from '../../../lib/utils';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import MyserLogo from '../../../assets/myser-logo.jpg';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';

export const RequirementDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { requirement, loading, error } = useRequirementService(
    params.id ? Number(params.id) : 0
  );
  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <img src={MyserLogo} alt="MYSER Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                FORMATO DE REQUERIMIENTO
              </h1>
              <h2 className="text-sm text-gray-600 dark:text-gray-400">
                SISTEMA INTEGRADO DE GESTIÓN
              </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">CÓDIGO</p>
            <p className="text-lg font-bold">{requirement?.code}</p>
          </div>
        </div>
      </div>

      {/* Requirement Info */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700 grid grid-cols-4 gap-4 mb-6 text-sm">
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">N° Requerimiento</p>
          <p>{requirement?.code}</p>
        </div>
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Área Solicitante</p>
          <p>{requirement?.employee.area}</p>
        </div>
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Persona Solicitante</p>
          <p>{`${requirement?.employee.firstName} ${requirement?.employee.lastName}`}</p>
        </div>
        <div>
          <p className="font-medium mb-1">Fecha de Emisión</p>
          <p>{formatDate(requirement?.createdAt || '')}</p>
        </div>
      </div>

      {/* Cost Center Info */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700 grid grid-cols-4 gap-4 mb-6 text-sm">
        <div className="col-span-3 border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Centro de Costo</p>
          <p>{requirement?.costCenter.name}</p>
        </div>
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Prioridad</p>
          <p>{requirement?.priority}</p>
        </div>
      </div>

      {/* Articles Table */}
      <div className="mb-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Item
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Unid
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Código
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Justificación
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Moneda
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Costo Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {requirement?.requirementArticles.map((reqArticle, index) => (
              <tr key={reqArticle.article.id}>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {String(index + 1).padStart(3, '0')}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {reqArticle.quantity}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {reqArticle.article.unitOfMeasure}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {reqArticle.article.code}
                </td>
                <td className="px-3 py-2 text-sm">{reqArticle.article.name}</td>
                <td className="px-3 py-2 text-sm">
                  {reqArticle.justification}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                  {reqArticle.currency}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                  {(reqArticle.quantity * reqArticle.unitPrice).toFixed(2)}{' '}
                </td>
              </tr>
            ))}
            {/* Subtotal PEN */}
            {requirement?.requirementArticles.some(
              article => article.currency === 'PEN'
            ) && (
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td colSpan={7} className="px-3 py-2 text-right font-medium">
                  SUBTOTAL PEN
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {requirement?.requirementArticles
                    .filter(article => article.currency === 'PEN')
                    .reduce(
                      (sum, article) =>
                        sum + article.quantity * article.unitPrice,
                      0
                    )
                    .toFixed(2)}{' '}
                </td>
              </tr>
            )}
            {/* Subtotal USD */}
            {requirement?.requirementArticles.some(
              article => article.currency === 'USD'
            ) && (
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td colSpan={7} className="px-3 py-2 text-right font-medium">
                  SUBTOTAL USD
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {requirement?.requirementArticles
                    .filter(article => article.currency === 'USD')
                    .reduce(
                      (sum, article) =>
                        sum + article.quantity * article.unitPrice,
                      0
                    )
                    .toFixed(2)}{' '}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Observations */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Observaciones:</h3>
        <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
          {requirement?.observation || 'Sin observaciones'}
        </p>
      </div>

      {/* Botón de regreso */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate(ROUTES.REQUIREMENTS)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
};
