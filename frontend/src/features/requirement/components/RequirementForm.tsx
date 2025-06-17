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
import { createRequirement } from '../../../services/api/requirementService';
import { useNavigate } from 'react-router-dom';

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
  justification: string;
}

export const RequirementForm = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
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
    observations: '',
  });
  const [articlesSelected, setArticlesSelected] = useState<Products[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);

  // Manejo de inputs generales
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
    const data = {
      priority: form.priority,
      costCenterId: form.costCenter,
      observation: form.observations,
      requirementArticles: articlesSelected.map(article => ({
        articleId: article.id.toString(),
        quantity: +article.quantity,
        unitPrice: +article.unitPrice,
        justification: article.justification,
      })),
    };
    const requirement = await createRequirement(data);
    console.log(requirement);
  };

  return (
    <form
      className="p-8 mx-auto space-y-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow"
      onSubmit={handleSubmit}
    >
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
                {c.name}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>

      {/* 2. Artículos solicitados */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Artículos solicitados</h2>
          <button
            type="button"
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                    <td className="px-2 py-2 text-center">{total}</td>
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
                <tr className="bg-gray-100 dark:bg-gray-800 font-bold">
                  <td colSpan={6} className="text-right px-2 py-2">
                    Total final:
                  </td>
                  <td className="text-center px-2 py-2">
                    {articlesSelected
                      .reduce((acc, art) => {
                        const t =
                          Number(art.quantity) > 0 && Number(art.unitPrice) > 0
                            ? Number(art.quantity) * Number(art.unitPrice)
                            : 0;
                        return acc + t;
                      }, 0)
                      .toFixed(2)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
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
          Guardar requerimiento
        </button>
      </div>
    </form>
  );
};
