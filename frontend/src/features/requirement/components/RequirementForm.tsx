import { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { FormInput } from '../../../components/common/FormInput';
import { FormSelect } from '../../../components/common/FormSelect';
import {
  CheckIcon,
  TrashIcon,
  PlusIcon,
} from '../../../components/common/Icons';
import { useArticleService } from '../../../hooks/useArticleService';
import { useCostCenters } from '../../costCenter/hooks/useCostCenter';
import { PRIORITIES, ROUTES } from '../../../config/constants';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import type { RequirementArticle } from '../../../types/requirement';
import { useAuthWarehouse } from '../../../hooks/useAuthService';
import {
  useRequirement,
  useCreateRequirement,
  useUpdateRequirement,
} from '../hooks/useRequirements';

interface ArticlesSelected {
  id: number;
  code: string;
  name: string;
  brand: { name: string };
  unitOfMeasure: string;
}

interface Products {
  id: number;
  code: string;
  name: string;
  brand: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  currency: 'PEN' | 'USD';
  justification: string;
}

export const RequirementForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // React Query hooks
  const { data: requirement, isLoading: loadingRequirement } = useRequirement(
    isEditing ? Number(id) : undefined
  );
  const createRequirementMutation = useCreateRequirement();
  const updateRequirementMutation = useUpdateRequirement();

  // Warehouses
  const { warehouses, loading: loadingWarehouse } = useAuthWarehouse();
  // Cost Centers
  const { data: costCenters, isLoading: loadingCostCenters } = useCostCenters(
    1,
    1000
  );
  // Articles (products)
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { articles, loading: loadingArticles } =
    useArticleService(debouncedSearch);

  // Debounce para búsqueda de artículos
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  const [form, setForm] = useState({
    priority: '',
    costCenter: '',
    costCenterSecondary: '',
    warehouse: '',
    observations: '',
  });
  const [articlesSelected, setArticlesSelected] = useState<Products[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del requerimiento si se está editando
  useEffect(() => {
    if (isEditing && requirement) {
      setForm({
        priority: requirement.priority,
        costCenter: requirement.costCenter.id.toString(),
        costCenterSecondary: requirement.costCenterSecondary.id.toString(),
        warehouse: requirement.warehouse.id.toString(),
        observations: requirement.observation || '',
      });

      // Convertir los artículos del requerimiento al formato del formulario
      const requirementProducts: Products[] =
        requirement.requirementArticles.map((ra: RequirementArticle) => ({
          id: ra.article.id,
          code: ra.article.code,
          name: ra.article.name,
          brand: ra.article.brand.name,
          unit: ra.article.unitOfMeasure,
          quantity: ra.quantity.toString(),
          unitPrice: ra.unitPrice.toString(),
          currency: ra.currency,
          justification: ra.justification,
        }));

      setArticlesSelected(requirementProducts);
    }
  }, [isEditing, requirement]);

  // Auto-seleccionar almacén si solo hay uno disponible
  useEffect(() => {
    if (warehouses && warehouses.length === 1 && !form.warehouse) {
      setForm(prev => ({
        ...prev,
        warehouse: warehouses[0].id.toString(),
      }));
    }
  }, [warehouses, form.warehouse]);

  // Manejo de inputs generales
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setError(null);
    const { name, value } = e.target;

    // Si se cambia el centro de costos principal, limpiar el secundario
    if (name === 'costCenter') {
      setForm(prev => ({
        ...prev,
        [name]: value,
        costCenterSecondary: '', // Limpiar el centro de costos secundario
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Manejo de inputs de artículos
  const handleArticleInput = (id: number, field: string, value: string) => {
    setArticlesSelected(prev =>
      prev.map(a => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  // Manejo específico para campos que deben estar en mayúsculas
  const handleTextInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const upperValue = value.toUpperCase();

    if (name === 'observations') {
      setForm(prev => ({ ...prev, [name]: upperValue }));
    } else {
      // Para justificaciones en artículos
      const articleId = parseInt(
        e.target.getAttribute('data-article-id') || '0'
      );
      if (articleId) {
        setArticlesSelected(prev =>
          prev.map(a =>
            a.id === articleId ? { ...a, justification: upperValue } : a
          )
        );
      }
    }
  };

  // Añadir producto desde el modal
  const addProductToArticles = (product: ArticlesSelected) => {
    if (!articlesSelected.some(a => a.id === product.id)) {
      setArticlesSelected(prev => [
        ...prev,
        {
          id: product.id,
          name: product.name,
          brand: product.brand.name,
          unit: product.unitOfMeasure,
          quantity: '',
          unitPrice: '',
          currency: 'PEN',
          justification: '',
        } as Products,
      ]);
    }
  };

  // Quitar producto desde el modal o tabla
  const removeProductFromArticles = (id: number) => {
    setArticlesSelected(prev => prev.filter(a => a.id !== id));
  };

  // Verificar si un artículo ya está seleccionado
  const isArticleSelected = (articleId: number) => {
    return articlesSelected.some(a => a.id === articleId);
  };

  // Calcular total por producto
  const calculateProductTotal = (quantity: string, unitPrice: string) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return qty * price;
  };

  // Calcular subtotales por moneda
  const calculateSubtotals = () => {
    const subtotals = { PEN: 0, USD: 0 };

    articlesSelected.forEach(article => {
      const total = calculateProductTotal(article.quantity, article.unitPrice);
      subtotals[article.currency] += total;
    });

    return subtotals;
  };

  const subtotals = calculateSubtotals();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (articlesSelected.length === 0) {
      setError('Debe seleccionar al menos un artículo');
      return;
    }

    const data = {
      priority: form.priority,
      costCenterId: form.costCenter,
      costCenterSecondaryId: form.costCenterSecondary,
      warehouseId: form.warehouse,
      observation: form.observations,
      requirementArticles: articlesSelected.map(article => ({
        articleId: article.id.toString(),
        quantity: +article.quantity,
        unitPrice: +article.unitPrice,
        justification: article.justification,
        currency: article.currency,
      })),
    };

    try {
      if (isEditing && id) {
        await updateRequirementMutation.mutateAsync({
          id: Number(id),
          data,
        });
      } else {
        await createRequirementMutation.mutateAsync(data);
      }
      navigate(ROUTES.REQUIREMENTS);
    } catch {
      setError(
        isEditing
          ? 'Error al actualizar el requerimiento'
          : 'Error al crear el requerimiento'
      );
    }
  };

  const getSecondaryCostCenters = () => {
    if (!form.costCenter || !costCenters?.data) return [];

    const primaryCostCenter = costCenters.data.find(
      cc => cc.id.toString() === form.costCenter
    );

    if (!primaryCostCenter?.children) return [];

    return primaryCostCenter.children;
  };

  const isLoading =
    loadingRequirement ||
    loadingWarehouse ||
    loadingCostCenters ||
    loadingArticles ||
    createRequirementMutation.isPending ||
    updateRequirementMutation.isPending;

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:mb-6 mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Editar Requerimiento' : 'Crear Requerimiento'}
        </h2>
      </div>

      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Información Básica
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormSelect
              id="priority"
              name="priority"
              label="Prioridad"
              value={form.priority}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar prioridad</option>
              {PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </FormSelect>

            <FormSelect
              id="costCenter"
              name="costCenter"
              label="Centro de Costos Principal"
              value={form.costCenter}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar centro de costos</option>
              {costCenters?.data?.map(costCenter => (
                <option key={costCenter.id} value={String(costCenter.id)}>
                  {costCenter.description}
                </option>
              ))}
            </FormSelect>

            <FormSelect
              id="costCenterSecondary"
              name="costCenterSecondary"
              label="Centro de Costos Secundario"
              value={form.costCenterSecondary}
              onChange={handleChange}
              disabled={!form.costCenter}
            >
              <option value="">Seleccionar centro de costos secundario</option>
              {getSecondaryCostCenters().map(costCenter => (
                <option key={costCenter.id} value={String(costCenter.id)}>
                  {costCenter.description}
                </option>
              ))}
            </FormSelect>

            <FormSelect
              id="warehouse"
              name="warehouse"
              label="Almacén"
              value={form.warehouse}
              onChange={handleChange}
              required
              disabled={warehouses && warehouses.length === 1}
            >
              <option value="">Seleccionar almacén</option>
              {warehouses?.map(warehouse => (
                <option key={warehouse.id} value={String(warehouse.id)}>
                  {warehouse.name}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="mt-4">
            <FormInput
              id="observations"
              name="observations"
              label="Observaciones"
              value={form.observations}
              onChange={e => handleTextInput(e)}
              type="textarea"
            />
          </div>
        </div>

        {/* Artículos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Artículos
            </h3>
            <button
              type="button"
              onClick={() => setShowProductModal(true)}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Agregar Artículo
            </button>
          </div>

          {articlesSelected.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay artículos seleccionados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Artículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Moneda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Justificación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {articlesSelected.map(article => (
                    <tr key={article.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {article.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {article.code} - {article.brand}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={article.quantity}
                          onChange={e =>
                            handleArticleInput(
                              article.id,
                              'quantity',
                              e.target.value
                            )
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value={article.unitPrice}
                          onChange={e =>
                            handleArticleInput(
                              article.id,
                              'unitPrice',
                              e.target.value
                            )
                          }
                          className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={article.currency}
                          onChange={e =>
                            handleArticleInput(
                              article.id,
                              'currency',
                              e.target.value
                            )
                          }
                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        >
                          <option value="PEN">PEN</option>
                          <option value="USD">USD</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={article.justification}
                          onChange={e => handleTextInput(e)}
                          data-article-id={article.id}
                          className="w-32 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {calculateProductTotal(
                          article.quantity,
                          article.unitPrice
                        ).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => removeProductFromArticles(article.id)}
                          className="bg-transparent text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Subtotales por moneda */}
        {articlesSelected.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Subtotales por Moneda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total PEN
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  S/ {subtotals.PEN.toFixed(2)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total USD
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $ {subtotals.USD.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.REQUIREMENTS)}
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

      {/* Modal de selección de artículos */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Seleccionar Artículo"
      >
        <div className="space-y-4">
          <FormInput
            id="search"
            name="search"
            label="Buscar artículo"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Buscar por código o nombre..."
          />

          <div className="max-h-96 overflow-y-auto">
            {loadingArticles ? (
              <div className="text-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="space-y-2">
                {articles?.map(article => {
                  const isSelected = isArticleSelected(article.id);
                  return (
                    <div
                      key={article.id}
                      className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        isSelected
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {article.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {article.code} - {article.brand?.name}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            removeProductFromArticles(article.id);
                          } else {
                            addProductToArticles(article);
                          }
                        }}
                        className={`${
                          isSelected
                            ? 'bg-transparent text-red-600 hover:text-red-900 dark:hover:text-red-400'
                            : 'bg-transparent text-blue-600 hover:text-blue-900 dark:hover:text-blue-400'
                        }`}
                      >
                        {isSelected ? (
                          <TrashIcon className="w-5 h-5" />
                        ) : (
                          <CheckIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
