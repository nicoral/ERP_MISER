import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { WarehouseDetails } from '../features/warehouse/components/WarehouseDetails';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { useWarehouse } from '../features/warehouse/hooks/useWarehouse';
import { ROUTES } from '../config/constants';

export const WarehouseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const warehouseId = id ? parseInt(id, 10) : undefined;

  const { data: warehouse, isLoading, error } = useWarehouse(warehouseId);

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="p-6">
        <ErrorBanner
          message={error?.message || 'No se pudo cargar el almacén'}
          onClose={() => navigate(ROUTES.WAREHOUSE)}
        />
      </div>
    );
  }

  return (
    <div className="sm:p-8 p-2">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(ROUTES.WAREHOUSE)}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Detalles del Almacén
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Información completa del almacén
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <WarehouseDetails warehouse={warehouse} />
      </div>
    </div>
  );
};
