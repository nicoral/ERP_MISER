import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormInput } from '../../components/common/FormInput';
import { FormSelect } from '../../components/common/FormSelect';
import { PlusIcon, TrashIcon } from '../../components/common/Icons';
import { useAuthWarehouse } from '../../hooks/useAuthService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { FormInputFile } from '../../components/common/FormInputFile';

// Dummy data for purchase orders and products
const DUMMY_ORDERS = [
  {
    id: 1,
    code: 'OC-001',
    items: [
      { id: 1, code: 'P-001', name: 'Producto 1', unit: 'UND', quantity: 10 },
      { id: 2, code: 'P-002', name: 'Producto 2', unit: 'UND', quantity: 5 },
    ],
  },
  {
    id: 2,
    code: 'OC-002',
    items: [
      { id: 2, code: 'P-002', name: 'Producto 2', unit: 'UND', quantity: 3 },
    ],
  },
];
const DUMMY_PRODUCTS = [
  { id: 1, code: 'P-001', name: 'Producto 1', unit: 'UND' },
  { id: 2, code: 'P-002', name: 'Producto 2', unit: 'UND' },
];

type ProductType = {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity?: string;
  received?: string;
  conform?: boolean;
  qualityCert?: boolean;
  guide?: boolean;
  inspection?: string;
  observation?: string;
};

export const EntryPartForm = () => {
  const navigate = useNavigate();
  const { warehouses, loading: loadingWarehouse } = useAuthWarehouse();
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    warehouse: '',
    order: '',
  });
  const [products, setProducts] = useState<ProductType[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Selección automática de almacén si solo hay uno
  useEffect(() => {
    if (warehouses && warehouses.length === 1 && !form.warehouse) {
      setForm(prev => ({ ...prev, warehouse: warehouses[0].id.toString() }));
    }
  }, [warehouses, form.warehouse]);

  // Autollenar productos al seleccionar orden de compra
  useEffect(() => {
    if (form.order) {
      const order = DUMMY_ORDERS.find(o => o.id.toString() === form.order);
      if (order) {
        setProducts(
          order.items.map(product => ({
            ...product,
            quantity: String(product.quantity),
            received: '',
            conform: false,
            qualityCert: false,
            guide: false,
            inspection: '',
            observation: '',
          }))
        );
      }
    } else {
      setProducts([]);
    }
  }, [form.order]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addProduct = (product: ProductType) => {
    if (!products.some(p => p.id === product.id)) {
      setProducts(prev => [
        ...prev,
        {
          ...product,
          quantity: '',
          received: '',
          conform: false,
          qualityCert: false,
          guide: false,
          inspection: '',
          observation: '',
        },
      ]);
    }
  };

  const removeProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleProductInput = (
    id: number,
    field: string,
    value: string | boolean
  ) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación básica
    if (!form.date || !form.warehouse || !form.order || products.length === 0) {
      setError('Completa todos los campos y agrega al menos un producto');
      return;
    }
    // Aquí iría la lógica de guardado
    navigate('/entry-parts');
  };

  if (loadingWarehouse) return <LoadingSpinner />;

  return (
    <div className="mx-auto p-2">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Nuevo Parte de Ingreso
      </h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Fecha"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <FormSelect
            label="Almacén"
            name="warehouse"
            value={form.warehouse}
            onChange={handleChange}
            required
            disabled={warehouses && warehouses.length === 1}
          >
            <option value="">Seleccionar almacén</option>
            {warehouses?.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            label="Orden de Compra"
            name="order"
            value={form.order}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar orden</option>
            {DUMMY_ORDERS.map(o => (
              <option key={o.id} value={o.id}>
                {o.code}
              </option>
            ))}
          </FormSelect>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Productos
            </h3>
            {!form.order && (
              <button
                type="button"
                onClick={() => setShowProductModal(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Agregar Producto
              </button>
            )}
          </div>
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay productos agregados
            </div>
          ) : (
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
                      Cant. Ordenada
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
                    {!form.order && (
                      <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {products.map((product, idx) => (
                    <tr key={product.id}>
                      <td className="px-2 py-2 text-center">{idx + 1}</td>
                      <td className="px-2 py-2">{product.name}</td>
                      <td className="px-2 py-2">{product.unit}</td>
                      <td className="px-2 py-2">
                        {form.order ? (
                          product.quantity
                        ) : (
                          <input
                            type="number"
                            value={product.quantity || ''}
                            onChange={e =>
                              handleProductInput(
                                product.id,
                                'quantity',
                                e.target.value
                              )
                            }
                            className="w-16 px-1 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          />
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={product.received || ''}
                          onChange={e =>
                            handleProductInput(
                              product.id,
                              'received',
                              e.target.value
                            )
                          }
                          className="w-16 px-1 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!product.conform}
                          onChange={e =>
                            handleProductInput(
                              product.id,
                              'conform',
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!product.qualityCert}
                          onChange={e =>
                            handleProductInput(
                              product.id,
                              'qualityCert',
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!product.guide}
                          onChange={e =>
                            handleProductInput(
                              product.id,
                              'guide',
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={product.inspection || ''}
                          onChange={e =>
                            handleProductInput(
                              product.id,
                              'inspection',
                              e.target.value
                            )
                          }
                          className="px-1 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">-</option>
                          <option value="ACEPTADO">Aceptado</option>
                          <option value="OBSERVADO">Observado</option>
                          <option value="RECHAZADO">Rechazado</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={product.observation || ''}
                          onChange={e =>
                            handleProductInput(
                              product.id,
                              'observation',
                              e.target.value
                            )
                          }
                          className="w-32 px-1 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      {!form.order && (
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className="bg-transparent text-red-600 hover:text-red-900 dark:hover:text-red-400"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Imagen de ingreso
            </h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Advertencia: La imagen de ingreso es opcional bajo su propia
            responsabilidad.
          </span>
          <div className="flex justify-start items-center">
            <FormInputFile
              label="Imagen de ingreso"
              name="image"
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/entry-parts')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Guardar
          </button>
        </div>
      </form>

      {/* Modal para agregar productos */}
      <Modal
        isOpen={showProductModal && !form.order}
        onClose={() => setShowProductModal(false)}
        title="Seleccionar Producto"
      >
        <div className="space-y-4">
          <FormInput
            id="search"
            name="search"
            label="Buscar producto"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Buscar por código o nombre..."
          />
          <div className="max-h-96 overflow-y-auto">
            {DUMMY_PRODUCTS.filter(
              p =>
                p.name.toLowerCase().includes(searchText.toLowerCase()) ||
                p.code.toLowerCase().includes(searchText.toLowerCase())
            ).map(product => {
              const isSelected = products.some(p => p.id === product.id);
              return (
                <div
                  key={product.id}
                  className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isSelected
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {product.code}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        removeProduct(product.id);
                      } else {
                        addProduct(product);
                      }
                    }}
                    className={`$ {
                      isSelected
                        ? 'bg-transparent text-red-600 hover:text-red-900 dark:hover:text-red-400'
                        : 'bg-transparent text-blue-600 hover:text-blue-900 dark:hover:text-blue-400'
                    }`}
                  >
                    {isSelected ? (
                      <TrashIcon className="w-5 h-5" />
                    ) : (
                      <PlusIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};
