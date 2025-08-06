import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import { useService, useDeleteService } from '../hooks/useServices';
import { ROUTES } from '../../../config/constants';
import { useToast } from '../../../contexts/ToastContext';
import { hasPermission } from '../../../utils/permissions';

export const ServiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { data: service, isLoading, error } = useService(Number(id));
  const deleteServiceMutation = useDeleteService();

  const handleDelete = async () => {
    if (
      !window.confirm('¿Estás seguro de que quieres eliminar este servicio?')
    ) {
      return;
    }

    try {
      await deleteServiceMutation.mutateAsync(service!.id);
      showSuccess(
        'Eliminado',
        `Servicio ${service!.name} eliminado correctamente`
      );
      navigate(ROUTES.SERVICES);
    } catch {
      showError('Error', 'No se pudo eliminar el servicio');
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="p-8">
        <ErrorBanner message="Error al cargar el servicio" onClose={() => {}} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detalles del Servicio
        </h2>
        <div className="flex space-x-3">
          {hasPermission('update_service') && (
            <button
              onClick={() => navigate(`${ROUTES.SERVICES}/edit/${service.id}`)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Editar
            </button>
          )}
          {hasPermission('delete_service') && (
            <button
              onClick={handleDelete}
              disabled={deleteServiceMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteServiceMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Información del Servicio
          </h3>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                ID
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {service.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Código
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {service.code}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Nombre
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {service.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Estado
              </dt>
              <dd className="mt-1">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    service.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {service.active ? 'Activo' : 'Inactivo'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Fecha de Creación
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(service.createdAt).toLocaleDateString()}
              </dd>
            </div>
            {service.updatedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Última Actualización
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(service.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Proveedor por Defecto
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {service.defaultSupplier ? (
                  <div>
                    <div className="font-medium">
                      {service.defaultSupplier.businessName}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      RUC: {service.defaultSupplier.ruc}
                    </div>
                    {service.defaultSupplier.contactPerson && (
                      <div className="text-gray-500 dark:text-gray-400">
                        Contacto: {service.defaultSupplier.contactPerson}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    No asignado
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};
