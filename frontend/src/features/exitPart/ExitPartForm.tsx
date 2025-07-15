import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormInput } from '../../components/common/FormInput';
import { FormInputFile } from '../../components/common/FormInputFile';
import { FormSelect } from '../../components/common/FormSelect';
import { PlusIcon, TrashIcon } from '../../components/common/Icons';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useArticleService } from '../../hooks/useArticleService';
import { useAuthWarehouse } from '../../hooks/useAuthService';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrderService';
import {
  useCreateExitPart,
  useUpdateExitPart,
  useUploadExitPartImage,
  useExitPart,
} from './hooks/useExitPart';
import type {
  CreateExitPartDto,
  UpdateExitPartDto,
} from '../../types/exitPart';
import { ExitPartStatus } from '../../types/exitPart';
import type { Article } from '../../types/article';
import type { PurchaseOrder } from '../../types/purchaseOrder';
import { ROUTES } from '../../config/constants';
import { useToast } from '../../contexts/ToastContext';

type ExitPartArticleType = {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  delivered: number;
  conform: boolean;
  qualityCert: boolean;
  guide: boolean;
  inspection: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  observation?: string;
  articleId: string;
};

export const ExitPartForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const isEditing = !!id;
  const exitPartId = id ? parseInt(id) : undefined;

  // Hooks para obtener datos
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { articles, loading: loadingArticles } =
    useArticleService(debouncedSearch);
  const { warehouses } = useAuthWarehouse();
  const { data: purchaseOrders } = usePurchaseOrders();

  // React Query hooks
  const { data: exitPart, isLoading: loadingExitPart } = useExitPart(
    exitPartId!
  );
  const createExitPartMutation = useCreateExitPart();
  const updateExitPartMutation = useUpdateExitPart();
  const uploadImageMutation = useUploadExitPartImage();

  const [form, setForm] = useState({
    exitDate: new Date().toISOString().split('T')[0],
    employeeId: user?.id?.toString() || '',
    warehouseId: '',
    purchaseOrderId: '',
    imageUrl: '',
    observation: '',
  });
  const [exitPartArticles, setExitPartArticles] = useState<
    ExitPartArticleType[]
  >([]);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showPurchaseOrderModal, setShowPurchaseOrderModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Debounce para búsqueda de artículos
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Actualizar employeeId cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id && !form.employeeId) {
      setForm(prev => ({ ...prev, employeeId: user.id.toString() }));
    }
  }, [user, form.employeeId]);

  // Auto-seleccionar almacén si solo hay uno disponible
  useEffect(() => {
    if (warehouses && warehouses.length === 1 && !form.warehouseId) {
      setForm(prev => ({
        ...prev,
        warehouseId: warehouses[0].id.toString(),
      }));
    }
  }, [warehouses, form.warehouseId]);

  // Cargar datos del ExitPart si se está editando
  useEffect(() => {
    if (isEditing && exitPart) {
      setForm({
        exitDate: new Date(exitPart.exitDate).toISOString().split('T')[0],
        employeeId: user?.id?.toString() || '',
        warehouseId: exitPart.warehouse?.id?.toString() || '',
        purchaseOrderId: exitPart.purchaseOrder?.id?.toString() || '',
        imageUrl: exitPart.imageUrl || '',
        observation: exitPart.observation || '',
      });

      // Convertir los artículos del ExitPart al formato del formulario
      const exitPartArticlesData: ExitPartArticleType[] =
        exitPart.exitPartArticles.map(article => ({
          id: article.id,
          code: article.code,
          name: article.name,
          unit: article.unit,
          quantity: article.quantity,
          delivered: article.delivered,
          conform: article.conform,
          qualityCert: article.qualityCert,
          guide: article.guide,
          inspection: article.inspection,
          observation: article.observation || '',
          articleId: article.id.toString(),
        }));

      setExitPartArticles(exitPartArticlesData);
    }
  }, [isEditing, exitPart]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm(prev => {
      if (e.target.name === 'observation') {
        return { ...prev, [e.target.name]: e.target.value.toUpperCase() };
      }
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Mostrar preview del archivo seleccionado
      setForm(prev => ({ ...prev, imageUrl: file.name }));
    }
  };

  const addArticle = (article: Article) => {
    if (!exitPartArticles.some(a => a.id === article.id)) {
      setExitPartArticles(prev => [
        ...prev,
        {
          id: article.id,
          code: article.code,
          name: article.name,
          unit: article.unitOfMeasure,
          quantity: 0, // This will be set to delivered when submitting
          delivered: 0,
          conform: false,
          qualityCert: false,
          guide: false,
          inspection: 'PENDING' as const,
          observation: '',
          articleId: article.id.toString(),
        },
      ]);
    }
  };

  const removeArticle = (id: number) => {
    setExitPartArticles(prev => prev.filter(a => a.id !== id));
  };

  const handleArticleInput = (
    id: number,
    field: string,
    value: string | number | boolean
  ) => {
    setExitPartArticles(prev =>
      prev.map(a => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handlePurchaseOrderSelect = (purchaseOrder: PurchaseOrder) => {
    setForm(prev => ({
      ...prev,
      purchaseOrderId: purchaseOrder.id.toString(),
    }));

    // Convertir los artículos de la orden de compra al formato del formulario
    const purchaseOrderArticles: ExitPartArticleType[] =
      purchaseOrder.items.map((item, index) => ({
        id: index + 1, // Usar índice temporal como ID
        code: item.code,
        name: item.description,
        unit: item.unit,
        quantity: item.quantity,
        delivered: 0, // Inicialmente 0, el usuario puede modificar
        conform: false,
        qualityCert: false,
        guide: false,
        inspection: 'PENDING' as const,
        observation: '',
        articleId: item.code, // Usar el código como articleId temporal
      }));

    setExitPartArticles(purchaseOrderArticles);
    setShowPurchaseOrderModal(false);
  };

  // Función helper para extraer mensaje de error
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      if (errorObj.response && typeof errorObj.response === 'object') {
        const response = errorObj.response as Record<string, unknown>;
        if (response.data && typeof response.data === 'object') {
          const data = response.data as Record<string, unknown>;
          if (typeof data.message === 'string') {
            return data.message;
          }
        }
      }
      if (typeof errorObj.message === 'string') {
        return errorObj.message;
      }
    }
    return defaultMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (
      !form.exitDate ||
      !form.employeeId ||
      !form.warehouseId ||
      exitPartArticles.length === 0
    ) {
      showError(
        'Completa todos los campos obligatorios y agrega al menos un artículo'
      );
      return;
    }

    try {
      if (isEditing) {
        // Modo edición - solo para ExitParts PENDING
        if (exitPart?.status !== ExitPartStatus.PENDING) {
          showError('Solo se pueden editar partes de salida pendientes');
          return;
        }

        const updateExitPartDto: UpdateExitPartDto = {
          observation: form.observation || undefined,
          exitDate: form.exitDate,
          employeeId: parseInt(form.employeeId),
          exitPartArticles: exitPartArticles.map(article => ({
            id: article.id,
            code: article.code,
            name: article.name,
            unit: article.unit,
            quantity: article.quantity,
            delivered: article.delivered,
            conform: article.conform,
            qualityCert: article.qualityCert,
            guide: article.guide,
            inspection: article.inspection,
            observation: article.observation,
            articleId: parseInt(article.articleId),
          })),
        };

        await updateExitPartMutation.mutateAsync({
          id: exitPartId!,
          data: updateExitPartDto,
        });
        if (selectedFile) {
          await uploadImageMutation.mutateAsync({
            id: exitPartId!,
            file: selectedFile,
          });
        }
        showSuccess('Actualizado', 'Parte de salida actualizado correctamente');
      } else {
        // Modo creación
        const createExitPartDto: CreateExitPartDto = {
          exitDate: form.exitDate,
          employeeId: form.employeeId,
          warehouseId: parseInt(form.warehouseId),
          purchaseOrderId: form.purchaseOrderId || undefined,
          imageUrl: undefined,
          observation: form.observation || undefined,
          exitPartArticles: exitPartArticles.map(article => ({
            code: article.code,
            name: article.name,
            unit: article.unit,
            quantity: article.delivered, // Set quantity to delivered
            delivered: article.delivered,
            conform: article.conform,
            qualityCert: article.qualityCert,
            guide: article.guide,
            inspection: article.inspection,
            observation: article.observation,
            articleId: article.articleId,
          })),
        };

        const savedExitPart =
          await createExitPartMutation.mutateAsync(createExitPartDto);

        // Si hay imagen seleccionada, subirla después de crear el ExitPart
        if (selectedFile && savedExitPart) {
          await uploadImageMutation.mutateAsync({
            id: savedExitPart.id,
            file: selectedFile,
          });
        }
        showSuccess('Creado', 'Parte de salida creado correctamente');
      }

      navigate(ROUTES.EXIT_PARTS);
    } catch (error) {
      console.error(error);
      const errorMessage = getErrorMessage(
        error,
        isEditing
          ? 'Error al actualizar la parte de salida'
          : 'Error al crear la parte de salida'
      );
      showError('Error', errorMessage);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500">Cargando usuario...</div>
    );
  }

  if (isEditing && loadingExitPart) {
    return (
      <div className="text-center py-8 text-gray-500">Cargando datos...</div>
    );
  }

  return (
    <div className="mx-auto p-2">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditing ? 'Editar Parte de Salida' : 'Nuevo Parte de Salida'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Fecha de Salida"
            name="exitDate"
            type="date"
            value={form.exitDate}
            onChange={handleChange}
            disabled={true}
            required
          />
          <FormSelect
            label="Almacén"
            name="warehouseId"
            value={form.warehouseId}
            onChange={handleChange}
            required
            disabled={(warehouses && warehouses.length === 1) || isEditing}
          >
            <option value="">Seleccionar almacén</option>
            {warehouses?.map(warehouse => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </FormSelect>
        </div>

        {/* Modal para seleccionar PurchaseOrder */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Orden de Compra (Opcional)
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPurchaseOrderModal(true)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Seleccionar Orden de Compra
                </button>
              </div>
              {form.purchaseOrderId && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900 rounded-md">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Orden de compra seleccionada - Los artículos se han cargado
                    automáticamente
                  </p>
                </div>
              )}
            </div>

            <div>
              <FormInputFile
                label="Imagen (Opcional)"
                name="imageFile"
                onChange={handleFileChange}
                accept="image/*"
              />
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  ⚠️ La imagen es opcional. Puedes subir una imagen relacionada
                  con la salida de mercancía.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observaciones
            </label>
            <textarea
              name="observation"
              value={form.observation}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Observaciones adicionales..."
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Artículos
            </h3>
            {!isEditing && !form.purchaseOrderId && (
              <button
                type="button"
                onClick={() => setShowArticleModal(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Agregar Artículo
              </button>
            )}
            {!isEditing && form.purchaseOrderId && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Artículos de la orden de compra seleccionada
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, purchaseOrderId: '' }));
                    setExitPartArticles([]);
                  }}
                  className="px-3 py-1 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cambiar Orden
                </button>
              </div>
            )}
          </div>
          {exitPartArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {form.purchaseOrderId
                ? 'Selecciona una orden de compra para cargar los artículos automáticamente'
                : 'Agrega artículos para la parte de salida'}
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
                      Cantidad
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Saliendo
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Conforme
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Cert. Calidad
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Guía
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Inspección
                    </th>
                    <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Observación
                    </th>
                    {!isEditing && (
                      <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {exitPartArticles.map((article, idx) => (
                    <tr key={article.id}>
                      <td className="px-2 py-2 text-center">{idx + 1}</td>
                      <td className="px-2 py-2">{article.name}</td>
                      <td className="px-2 py-2">{article.unit}</td>
                      <td className="px-2 py-2 text-center">
                        <span className="text-gray-600 dark:text-gray-400">
                          {article.quantity}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="number"
                          value={article.delivered}
                          min={0}
                          max={
                            article.quantity > 0 ? article.quantity : 9999999999
                          }
                          onChange={e =>
                            handleArticleInput(
                              article.id,
                              'delivered',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-16 px-1 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={article.conform}
                          onChange={e =>
                            handleArticleInput(
                              article.id,
                              'conform',
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={article.qualityCert}
                          onChange={e =>
                            handleArticleInput(
                              article.id,
                              'qualityCert',
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={article.guide}
                          onChange={e =>
                            handleArticleInput(
                              article.id,
                              'guide',
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={article.inspection}
                          onChange={e =>
                            handleArticleInput(
                              article.id,
                              'inspection',
                              e.target.value as
                                | 'PENDING'
                                | 'ACCEPTED'
                                | 'REJECTED'
                            )
                          }
                          className="px-1 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="ACCEPTED">Aceptado</option>
                          <option value="REJECTED">Rechazado</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={article.observation || ''}
                          onChange={e =>
                            handleArticleInput(
                              article.id,
                              'observation',
                              e.target.value.toUpperCase()
                            )
                          }
                          className="w-full px-1 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      {!isEditing && (
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeArticle(article.id)}
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

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.EXIT_PARTS)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={
              createExitPartMutation.isPending ||
              updateExitPartMutation.isPending ||
              uploadImageMutation.isPending
            }
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createExitPartMutation.isPending ||
            updateExitPartMutation.isPending ||
            uploadImageMutation.isPending
              ? 'Guardando...'
              : isEditing
                ? 'Actualizar'
                : 'Guardar'}
          </button>
        </div>
      </form>

      {/* Modal para agregar artículos - solo en modo creación */}
      {!isEditing && (
        <Modal
          isOpen={showArticleModal}
          onClose={() => setShowArticleModal(false)}
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
                <div className="text-center py-4">Cargando artículos...</div>
              ) : (
                articles
                  .filter(
                    article =>
                      article.name
                        .toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                      article.code
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
                  )
                  .map(article => {
                    const isSelected = exitPartArticles.some(
                      a => a.id === article.id
                    );
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
                            {article.code} - {article.unitOfMeasure}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              removeArticle(article.id);
                            } else {
                              addArticle(article);
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
                            <PlusIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal para seleccionar PurchaseOrder */}
      <Modal
        isOpen={showPurchaseOrderModal}
        onClose={() => setShowPurchaseOrderModal(false)}
        title="Seleccionar Orden de Compra"
      >
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto">
            {purchaseOrders?.map(purchaseOrder => {
              const isSelected =
                form.purchaseOrderId === purchaseOrder.id.toString();
              return (
                <div
                  key={purchaseOrder.id}
                  className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isSelected
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {purchaseOrder.code}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Proveedor: {purchaseOrder.supplier?.businessName || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Fecha:{' '}
                      {new Date(purchaseOrder.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePurchaseOrderSelect(purchaseOrder)}
                    className={`${
                      isSelected
                        ? 'bg-transparent text-green-600 hover:text-green-900 dark:hover:text-green-400'
                        : 'bg-transparent text-blue-600 hover:text-blue-900 dark:hover:text-blue-400'
                    }`}
                  >
                    {isSelected ? (
                      <span className="text-sm font-medium">
                        ✓ Seleccionada
                      </span>
                    ) : (
                      <span className="text-sm font-medium">Seleccionar</span>
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
