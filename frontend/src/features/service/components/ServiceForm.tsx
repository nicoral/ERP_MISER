import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormInput } from '../../../components/common/FormInput';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import {
  useService,
  useCreateService,
  useUpdateService,
} from '../hooks/useServices';
import { useSupplierService } from '../../../hooks/useSupplierService';
import { ROUTES } from '../../../config/constants';
import { useToast } from '../../../contexts/ToastContext';

export const ServiceForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useToast();
  const isEditing = !!id;

  // React Query hooks
  const { data: service, isLoading: loadingService } = useService(
    isEditing ? Number(id) : undefined
  );
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  // Hook para obtener proveedores
  const { suppliers, loading: loadingSuppliers } = useSupplierService();

  const [form, setForm] = useState({
    code: '',
    name: '',
    active: true,
    defaultSupplierId: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del servicio si se está editando
  useEffect(() => {
    if (isEditing && service) {
      setForm({
        code: service.code,
        name: service.name,
        active: service.active,
        defaultSupplierId: service.defaultSupplierId || 0,
      });
    }
  }, [isEditing, service]);

  // Convertir proveedores a opciones para el SearchableSelect
  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.id,
    label: `${supplier.businessName} - ${supplier.ruc}`,
  }));

  // Manejo de inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setError(null);
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.code.trim() || !form.name.trim()) {
      setError('Los campos código y nombre son obligatorios');
      return;
    }

    // Preparar datos para enviar (convertir defaultSupplierId a number o undefined)
    const submitData = {
      ...form,
      defaultSupplierId:
        form.defaultSupplierId === 0
          ? undefined
          : Number(form.defaultSupplierId),
    };

    try {
      if (isEditing && id) {
        await updateServiceMutation.mutateAsync({
          id: Number(id),
          data: submitData,
        });
        showSuccess('Actualizado', 'Servicio actualizado correctamente');
      } else {
        await createServiceMutation.mutateAsync(submitData);
        showSuccess('Creado', 'Servicio creado correctamente');
      }
      navigate(ROUTES.SERVICES);
    } catch {
      const errorMessage = isEditing
        ? 'Error al actualizar el servicio'
        : 'Error al crear el servicio';
      setError(errorMessage);
      showError('Error', errorMessage);
    }
  };

  const isLoading =
    loadingService ||
    loadingSuppliers ||
    createServiceMutation.isPending ||
    updateServiceMutation.isPending;

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:mb-6 mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Editar Servicio' : 'Crear Servicio'}
        </h2>
      </div>

      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="code"
              name="code"
              label="Código"
              value={form.code}
              onChange={handleChange}
              required
              placeholder="Ej: SER001"
            />

            <FormInput
              id="name"
              name="name"
              label="Nombre"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ej: Servicio de Mantenimiento"
            />

            <SearchableSelect
              id="defaultSupplierId"
              name="defaultSupplierId"
              label="Proveedor (Solo Administración)"
              value={form.defaultSupplierId}
              onChange={handleChange}
              options={supplierOptions}
              placeholder="Seleccionar proveedor por defecto"
            />

            <div className="flex items-center">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="active"
                className="ml-2 block text-sm text-gray-900 dark:text-white"
              >
                Activo
              </label>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SERVICES)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
};
