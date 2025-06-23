import { useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { FormInput } from '../../../components/common/FormInput';
import { FormSelect } from '../../../components/common/FormSelect';
import { getCurrentUser } from '../../../services/auth/authService';
import {
  CheckIcon,
  TrashIcon,
  PlusIcon,
} from '../../../components/common/Icons';
import { useArticleService } from '../../../hooks/useArticleService';
import { useCostCenters } from '../../costCenter/hooks/useCostCenter';
import { PRIORITIES, ROUTES } from '../../../config/constants';
import {
  createRequirement,
  updateRequirement,
  getRequirement,
} from '../../../services/api/requirementService';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../../components/common/ErrorBanner';
import type { RequirementArticle } from '../../../types/requirement';
import { useAuthWarehouse } from '../../../hooks/useAuthService';

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
  const user = getCurrentUser();
  // Warehouses
  const { warehouses, loading: loadingWarehouse } = useAuthWarehouse();
  // Cost Centers
  const { costCenters, loading: loadingCostCenters } = useCostCenters(1, 1000);
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
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del requerimiento si se está editando
  useEffect(() => {
    if (isEditing && id) {
      const loadRequirement = async () => {
        try {
          setLoadingData(true);
          const requirement = await getRequirement(Number(id));

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
        } catch (error) {
          console.error('Error loading requirement:', error);
          setError('Error al cargar el requerimiento');
        } finally {
          setLoadingData(false);
        }
      };

      loadRequirement();
    }
  }, [isEditing, id]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingData(true);
    setError(null);
    if (articlesSelected.length === 0) {
      setError('Debe seleccionar al menos un artículo');
      setLoadingData(false);
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
        await updateRequirement(Number(id), data);
      } else {
        await createRequirement(data);
      }
      navigate(ROUTES.REQUIREMENTS);
    } catch (error) {
      console.log(error);
      setError(
        `Error al ${isEditing ? 'actualizar' : 'crear'} el requerimiento`
      );
    } finally {
      setLoadingData(false);
    }
  };

  // Obtener los centros de costos secundarios basados en el centro de costos principal seleccionado
  const getSecondaryCostCenters = () => {
    if (!form.costCenter) return [];

    const selectedCostCenter = costCenters.find(
      c => c.id.toString() === form.costCenter
    );
    return selectedCostCenter?.children || [];
  };

  if (loadingData) return <LoadingSpinner />;

  return (
    <form
      className="p-4 sm:p-8 mx-auto space-y-8 bg-white dark:bg-gray-800 sm:rounded-lg shadow"
      onSubmit={handleSubmit}
    >
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
      {/* 1. Información del requerimiento */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Información del requerimiento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Solicitante
            </label>
            <div className="bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 text-gray-800 dark:text-gray-200">
              {user?.firstName + ' ' + user?.lastName || ''}
            </div>
          </div>
          <FormSelect
            name="warehouse"
            label="Almacén"
            value={
              warehouses && warehouses.length === 1
                ? warehouses[0].id
                : form.warehouse
            }
            onChange={handleChange}
            required
            disabled={
              loadingWarehouse || (warehouses && warehouses.length === 1)
            }
          >
            <option value="">Selecciona almacén</option>
            {warehouses?.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </FormSelect>

          <FormSelect
            name="priority"
            label="Prioridad"
            value={form.priority}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona prioridad</option>
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </FormSelect>

          <FormSelect
            name="costCenter"
            label="Centro de costos"
            value={form.costCenter}
            onChange={handleChange}
            required
            disabled={loadingCostCenters}
          >
            <option value="">Selecciona centro de costos</option>
            {costCenters?.map(c => (
              <option key={c.id} value={c.id}>
                {c.description}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            name="costCenterSecondary"
            label="Centro de costos secundario"
            value={form.costCenterSecondary}
            onChange={handleChange}
            required
            disabled={loadingCostCenters || !form.costCenter}
          >
            <option value="">
              {!form.costCenter
                ? 'Selecciona primero un centro de costos principal'
                : 'Selecciona centro de costos secundario'}
            </option>
            {getSecondaryCostCenters().map(c => (
              <option key={c.id} value={c.id}>
                {c.description}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>

      {/* 2. Artículos solicitados */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
          <h2 className="text-xl font-bold">Artículos solicitados</h2>
          <button
            type="button"
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
            onClick={() => setShowProductModal(true)}
          >
            <PlusIcon className="w-5 h-5 mr-2" /> Añadir artículos
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-2 py-2 text-center">ID</th>
                <th className="px-2 py-2 text-center">Nombre</th>
                <th className="px-2 py-2 text-center">Marca</th>
                <th className="px-2 py-2 text-center">Unidad</th>
                <th className="px-2 py-2 text-center">Cantidad</th>
                <th className="px-2 py-2 text-center">Costo Ref Unitario</th>
                <th className="px-2 py-2 text-center">Moneda</th>
                <th className="px-2 py-2 text-center">Total</th>
                <th className="px-2 py-2 text-center">Justificación</th>
                <th className="px-2 py-2 text-center">Quitar</th>
              </tr>
            </thead>
            <tbody>
              {articlesSelected.map(article => {
                const total =
                  Number(article.quantity) > 0 && Number(article.unitPrice) > 0
                    ? (
                        Number(article.quantity) * Number(article.unitPrice)
                      ).toFixed(2)
                    : '';
                return (
                  <tr
                    key={article.id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-2 py-2 text-center">{article.id}</td>
                    <td className="px-2 py-2 text-center">{article.name}</td>
                    <td className="px-2 py-2 text-center">{article.brand}</td>
                    <td className="px-2 py-2 text-center">{article.unit}</td>
                    <td className="w-20 px-2 py-2 text-center">
                      <FormInput
                        name={`quantity-${article.id}`}
                        value={article.quantity}
                        type="number"
                        min="1"
                        className="text-center mx-auto text-xs"
                        onChange={e =>
                          handleArticleInput(
                            article.id,
                            'quantity',
                            e.target.value
                          )
                        }
                        required
                      />
                    </td>
                    <td className="w-22 px-2 py-2 text-center">
                      <FormInput
                        name={`unitPrice-${article.id}`}
                        value={article.unitPrice}
                        type="number"
                        min="0"
                        step="0.01"
                        className="text-center mx-auto text-xs"
                        onChange={e =>
                          handleArticleInput(
                            article.id,
                            'unitPrice',
                            e.target.value
                          )
                        }
                        required
                      />
                    </td>
                    <td className="w-20 px-2 py-2 text-center">
                      <FormSelect
                        value={article.currency}
                        onChange={e =>
                          handleArticleInput(
                            article.id,
                            'currency',
                            e.target.value
                          )
                        }
                        className="px-0"
                      >
                        <option value="PEN">PEN</option>
                        <option value="USD">USD</option>
                      </FormSelect>
                    </td>
                    <td className="px-2 py-2 text-center">
                      {total && `${total} ${article.currency}`}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <FormInput
                        name={`justification-${article.id}`}
                        value={article.justification}
                        onChange={e =>
                          handleArticleInput(
                            article.id,
                            'justification',
                            e.target.value
                          )
                        }
                        required
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        className="bg-transparent text-red-600 hover:text-red-800"
                        onClick={() => removeProductFromArticles(article.id)}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {articlesSelected.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-500">
                    No hay artículos añadidos.
                  </td>
                </tr>
              )}
              {/* Fila de total final */}
              {articlesSelected.length > 0 && (
                <>
                  {/* Subtotal PEN */}
                  {articlesSelected.some(art => art.currency === 'PEN') && (
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <td colSpan={7} className="text-right px-2 py-2">
                        Subtotal PEN:
                      </td>
                      <td className="text-center px-2 py-2">
                        {articlesSelected
                          .filter(art => art.currency === 'PEN')
                          .reduce((acc, art) => {
                            const t =
                              Number(art.quantity) > 0 &&
                              Number(art.unitPrice) > 0
                                ? Number(art.quantity) * Number(art.unitPrice)
                                : 0;
                            return acc + t;
                          }, 0)
                          .toFixed(2)}{' '}
                        PEN
                      </td>
                      <td colSpan={1}></td>
                    </tr>
                  )}
                  {/* Subtotal USD */}
                  {articlesSelected.some(art => art.currency === 'USD') && (
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <td colSpan={7} className="text-right px-2 py-2">
                        Subtotal USD:
                      </td>
                      <td className="text-center px-2 py-2">
                        {articlesSelected
                          .filter(art => art.currency === 'USD')
                          .reduce((acc, art) => {
                            const t =
                              Number(art.quantity) > 0 &&
                              Number(art.unitPrice) > 0
                                ? Number(art.quantity) * Number(art.unitPrice)
                                : 0;
                            return acc + t;
                          }, 0)
                          .toFixed(2)}{' '}
                        USD
                      </td>
                      <td colSpan={1}></td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para añadir artículos */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Seleccionar artículos"
      >
        <div className="mb-4">
          <FormInput
            name="search"
            label="Buscar artículo"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-2 py-2 text-center">ID</th>
                <th className="px-2 py-2 text-center">Código</th>
                <th className="px-2 py-2 text-center">Nombre</th>
                <th className="px-2 py-2 text-center">Marca</th>
                <th className="px-2 py-2 text-center">Unidad</th>
                <th className="px-2 py-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loadingArticles ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Cargando artículos...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No se encontraron artículos.
                  </td>
                </tr>
              ) : (
                articles.map(product => {
                  const isAdded = articlesSelected.some(
                    a => a.id === product.id
                  );
                  return (
                    <tr
                      key={product.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-2 py-2 text-center">{product.id}</td>
                      <td className="px-2 py-2 text-center">{product.code}</td>
                      <td className="px-2 py-2 text-center">{product.name}</td>
                      <td className="px-2 py-2 text-center">
                        {product.brand.name}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {product.unitOfMeasure}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {isAdded ? (
                          <button
                            type="button"
                            className="bg-transparent text-red-600 hover:text-red-800"
                            onClick={() =>
                              removeProductFromArticles(product.id)
                            }
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="bg-transparent text-green-600 hover:text-green-800"
                            onClick={() => addProductToArticles(product)}
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => setShowProductModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Observaciones */}
      <div>
        <h2 className="text-xl font-bold mb-2">Observaciones</h2>
        <textarea
          name="observations"
          className="input w-full min-h-[80px]"
          value={form.observations}
          onChange={handleChange}
          placeholder="Observaciones adicionales..."
        />
      </div>

      {/* Botón de enviar (puedes adaptar la lógica de envío) */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => navigate(ROUTES.REQUIREMENTS)}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditing ? 'Actualizar requerimiento' : 'Guardar requerimiento'}
        </button>
      </div>
    </form>
  );
};
