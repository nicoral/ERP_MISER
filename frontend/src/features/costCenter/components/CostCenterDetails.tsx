import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ROUTES } from '../../../config/constants';
import type { CostCenter } from '../../../types/costCenter';
import { useCostCenter } from '../hooks/useCostCenter';
import {
  ChevronLeftIcon,
  CostCenterIcon,
} from '../../../components/common/Icons';
import { hasPermission } from '../../../utils/permissions';

interface CostCenterCardProps {
  costCenter: CostCenter;
  level?: number;
  isChild?: boolean;
  showDetails?: boolean;
}

const CostCenterCard: React.FC<CostCenterCardProps> = ({
  costCenter,
  level = 0,
  isChild = false,
  showDetails = true,
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${isChild ? 'ml-6' : ''}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CostCenterIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {costCenter.description}
              </h3>
              {costCenter.code && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Código: {costCenter.code} | Propietario: {costCenter.owner}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {showDetails && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Serial:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {costCenter.serial || 'No especificado'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Código Mina:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {costCenter.codeMine || 'No especificado'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  ID:
                </span>
                <span className="text-sm text-gray-900 dark:text-white font-mono">
                  #{costCenter.id}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Modelo:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {costCenter.model || 'No especificado'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Marca:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {costCenter.brand || 'No especificado'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Placa:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {costCenter.licensePlate || 'No especificado'}
                </span>
              </div>
            </div>
          </div>

          {/* Children */}
          {costCenter.children && costCenter.children.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Centros de Costo Secundarios ({costCenter.children.length})
                </h4>
              </div>
              <div className="space-y-4">
                {costCenter.children.map(child => (
                  <CostCenterCard
                    key={child.id}
                    costCenter={child}
                    level={level + 1}
                    isChild={true}
                    showDetails={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const CostCenterDetails = () => {
  const navigate = useNavigate();
  const params = useParams();
  const costCenterId = params.id ? Number(params.id) : 0;

  const { data: costCenter, isLoading } = useCostCenter(costCenterId);

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (!costCenter) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Centro de Costo no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            El centro de costo que buscas no existe o ha sido eliminado.
          </p>
          <button
            onClick={() => navigate(ROUTES.COST_CENTER)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:mb-6 mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(ROUTES.COST_CENTER)}
            className="bg-transparent p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Volver"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Detalles del Centro de Costo
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Información completa y estructura jerárquica
            </p>
          </div>
        </div>

        <div className="flex space-x-3 mt-4 sm:mt-0">
          {hasPermission('update_cost_centers') && (
            <button
              onClick={() =>
                navigate(
                  ROUTES.COST_CENTER_EDIT.replace(
                    ':id',
                    costCenter.id.toString()
                  )
                )
              }
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Parent Info */}
        {costCenter.parent && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CostCenterIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Centro de Costo Padre
              </span>
            </div>
            <p className="text-blue-900 dark:text-blue-200">
              {costCenter.parent.description}
            </p>
          </div>
        )}

        {/* Main Cost Center Card */}
        <CostCenterCard costCenter={costCenter} />

        {/* Metadata */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(costCenter.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Actualizado:
              </span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {new Date(costCenter.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Estado:</span>
              <span
                className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  costCenter.deletedAt
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                }`}
              >
                {costCenter.deletedAt ? 'Eliminado' : 'Activo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
