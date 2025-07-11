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
import {
  useCreateEntryPart,
  useUpdateEntryPart,
  useUploadEntryPartImage,
  useEntryPart,
} from './hooks/useEntryPart';
import type {
  CreateEntryPartDto,
  UpdateEntryPartDto,
} from '../../types/entryPart';
import { EntryPartStatus } from '../../types/entryPart';
import type { Article } from '../../types/article';
import { ROUTES } from '../../config/constants';

type EntryPartArticleType = {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  received: number;
  conform: boolean;
  qualityCert: boolean;
  guide: boolean;
  inspection: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  observation?: string;
  articleId: string;
};

export const EntryPartForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEditing = !!id;
  const entryPartId = id ? parseInt(id) : undefined;

  // Hooks para obtener datos
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { articles, loading: loadingArticles } =
    useArticleService(debouncedSearch);
  const { warehouses } = useAuthWarehouse();

  // React Query hooks
  const { data: entryPart, isLoading: loadingEntryPart } = useEntryPart(
    entryPartId!
  );
  const createEntryPartMutation = useCreateEntryPart();
  const updateEntryPartMutation = useUpdateEntryPart();
  const uploadImageMutation = useUploadEntryPartImage();

  const [form, setForm] = useState({
    entryDate: new Date().toISOString().split('T')[0],
    employeeId: user?.id?.toString() || '',
    warehouseId: '',
    purchaseOrderId: '',
    imageUrl: '',
    observation: '',
  });
  const [entryPartArticles, setEntryPartArticles] = useState<
    EntryPartArticleType[]
  >([]);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Cargar datos del EntryPart si se está editando
  useEffect(() => {
    if (isEditing && entryPart) {
      setForm({
        entryDate: new Date(entryPart.entryDate).toISOString().split('T')[0],
        employeeId: user?.id?.toString() || '',
        warehouseId: entryPart.warehouse?.id?.toString() || '',
        purchaseOrderId: entryPart.purchaseOrder?.id?.toString() || '',
        imageUrl: entryPart.imageUrl || '',
        observation: entryPart.observation || '',
      });

      // Convertir los artículos del EntryPart al formato del formulario
      const entryPartArticlesData: EntryPartArticleType[] =
        entryPart.entryPartArticles.map(article => ({
          id: article.id,
          code: article.code,
          name: article.name,
          unit: article.unit,
          quantity: article.quantity,
          received: article.received,
          conform: article.conform,
          qualityCert: article.qualityCert,
          guide: article.guide,
          inspection: article.inspection,
          observation: article.observation || '',
          articleId: article.id.toString(),
        }));

      setEntryPartArticles(entryPartArticlesData);
    }
  }, [isEditing, entryPart]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    if (!entryPartArticles.some(a => a.id === article.id)) {
      setEntryPartArticles(prev => [
        ...prev,
        {
          id: article.id,
          code: article.code,
          name: article.name,
          unit: article.unitOfMeasure,
          quantity: 0, // This will be set to received when submitting
          received: 0,
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
    setEntryPartArticles(prev => prev.filter(a => a.id !== id));
  };

  const handleArticleInput = (
    id: number,
    field: string,
    value: string | number | boolean
  ) => {
    setEntryPartArticles(prev =>
      prev.map(a => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (
      !form.entryDate ||
      !form.employeeId ||
      !form.warehouseId ||
      entryPartArticles.length === 0
    ) {
      setError(
        'Completa todos los campos obligatorios y agrega al menos un artículo'
      );
      return;
    }

    try {
      if (isEditing) {
        // Modo edición - solo para EntryParts PENDING
        if (entryPart?.status !== EntryPartStatus.PENDING) {
          setError('Solo se pueden editar partes de ingreso pendientes');
          return;
        }

        const updateEntryPartDto: UpdateEntryPartDto = {
          observation: form.observation || undefined,
          entryDate: form.entryDate,
          employeeId: parseInt(form.employeeId),
          entryPartArticles: entryPartArticles.map(article => ({
            id: article.id,
            code: article.code,
            name: article.name,
            unit: article.unit,
            quantity: article.quantity,
            received: article.received,
            conform: article.conform,
            qualityCert: article.qualityCert,
            guide: article.guide,
            inspection: article.inspection,
            observation: article.observation,
            articleId: parseInt(article.articleId),
          })),
        };

        await updateEntryPartMutation.mutateAsync({
          id: entryPartId!,
          data: updateEntryPartDto,
        });
        if (selectedFile) {
          await uploadImageMutation.mutateAsync({
            id: entryPartId!,
            file: selectedFile,
          });
        }
      } else {
        // Modo creación
        const createEntryPartDto: CreateEntryPartDto = {
          entryDate: form.entryDate,
          employeeId: form.employeeId,
          warehouseId: parseInt(form.warehouseId),
          purchaseOrderId: form.purchaseOrderId || undefined,
          imageUrl: undefined,
          observation: form.observation || undefined,
          entryPartArticles: entryPartArticles.map(article => ({
            code: article.code,
            name: article.name,
            unit: article.unit,
            quantity: article.received, // Set quantity to received
            received: article.received,
            conform: article.conform,
            qualityCert: article.qualityCert,
            guide: article.guide,
            inspection: article.inspection,
            observation: article.observation,
            articleId: article.articleId,
          })),
        };

        const savedEntryPart =
          await createEntryPartMutation.mutateAsync(createEntryPartDto);

        // Si hay imagen seleccionada, subirla después de crear el EntryPart
        if (selectedFile && savedEntryPart) {
          await uploadImageMutation.mutateAsync({
            id: savedEntryPart.id,
            file: selectedFile,
          });
        }
      }

      navigate(ROUTES.ENTRY_PARTS);
    } catch (error) {
      console.error(error);
      setError('Error al guardar la parte de ingreso');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500">Cargando usuario...</div>
    );
  }

  if (isEditing && loadingEntryPart) {
    return (
      <div className="text-center py-8 text-gray-500">Cargando datos...</div>
    );
  }

  return (
    <div className="mx-auto p-2">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditing ? 'Editar Parte de Ingreso' : 'Nuevo Parte de Ingreso'}
      </h2>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Fecha de Ingreso"
            name="entryDate"
            type="date"
            value={form.entryDate}
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

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  con la entrada de mercancía.
                </p>
              </div>
            </div>

            <div>
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
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Artículos
            </h3>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setShowArticleModal(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Agregar Artículo
              </button>
            )}
          </div>
          {entryPartArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Agrega artículos para la parte de ingreso
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
                    {isEditing && (
                      <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Cant. Esperada
                      </th>
                    )}
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
                    {!isEditing && (
                      <th className="px-2 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {entryPartArticles.map((article, idx) => (
                    <tr key={article.id}>
                      <td className="px-2 py-2 text-center">{idx + 1}</td>
                      <td className="px-2 py-2">{article.name}</td>
                      <td className="px-2 py-2">{article.unit}</td>
                      {isEditing && (
                        <td className="px-2 py-2 text-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            {article.quantity}
                          </span>
                        </td>
                      )}
                      <td className="px-2 py-2 text-center">
                        <input
                          type="number"
                          value={article.received}
                          min={0}
                          max={
                            article.quantity > 0 ? article.quantity : 9999999999
                          }
                          onChange={e =>
                            handleArticleInput(
                              article.id,
                              'received',
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
                              e.target.value
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

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.ENTRY_PARTS)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={
              createEntryPartMutation.isPending ||
              updateEntryPartMutation.isPending ||
              uploadImageMutation.isPending
            }
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {createEntryPartMutation.isPending ||
            updateEntryPartMutation.isPending ||
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
                    const isSelected = entryPartArticles.some(
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
    </div>
  );
};
