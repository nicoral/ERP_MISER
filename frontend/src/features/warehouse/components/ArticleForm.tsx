import { FormCheckbox } from '../../../components/common/FormCheckbox';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { COMMON_TEXTS, WAREHOUSE_TEXTS } from '../../../config/texts';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FormInput } from '../../../components/common/FormInput';
import {
  ALPHABET,
  ROTATION_CLASSIFICATIONS,
  ROUTES,
  UNIQUE_CATEGORIES,
  UNITS_OF_MEASURE,
} from '../../../config/constants';
import { useArticle, useBrands } from '../hooks/useArticle';
import { useWarehouses } from '../hooks/useWarehouse';
import {
  createArticle,
  updateArticle,
  createBrand,
} from '../../../services/api/articleService';
import { FormSelect } from '../../../components/common/FormSelect';
import { PlusIcon, TrashIcon } from '../../../components/common/Icons';
import type { Warehouse } from '../../../types/warehouse';
import { ImagePreview } from '../../../components/common/ImagePreview';
import type {
  Brand,
  WarehouseStock,
  WarehouseStockCreate,
} from '../../../types/article';
import { Modal } from '../../../components/common/Modal';

interface NewBrand {
  name: string;
  imageUrl: string;
}

export const ArticleForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEditing = Boolean(params.id);
  const articleId = params.id ? Number(params.id) : undefined;

  const { article, loading: loadingArticle } = useArticle(articleId);
  const { warehouses } = useWarehouses(1, 1000);

  const { brands, refreshBrands } = useBrands();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({
    name: '',
    code: '',
    unitOfMeasure: '',
    line: '',
    lineId: 'A',
    shelf: 'A',
    shelfId: '1',
    type: '',
    rotationClassification: '',
    minStock: 0,
    maxStock: 0,
    active: true,
    brandId: '',
    imageUrl: '',
    warehouseArticles: [] as WarehouseStockCreate[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrand, setNewBrand] = useState<NewBrand>({
    name: '',
    imageUrl: '',
  });
  const [creatingBrand, setCreatingBrand] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { line, lineId, shelf, shelfId, ...rest } = formData;
    const data = {
      ...rest,
      line: `${line} - ${lineId}`,
      shelf: `${COMMON_TEXTS.group} ${shelf} - ${shelfId}`,
    };
    try {
      if (isEditing) {
        await updateArticle(articleId ?? 0, data);
      } else {
        await createArticle(data);
      }
      navigate(ROUTES.WAREHOUSE_ARTICLES);
    } catch {
      setError(WAREHOUSE_TEXTS.articles.form.errors.save);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleWarehouseStockChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => {
      const newWarehouseStocks = [...prev.warehouseArticles];
      newWarehouseStocks[index] = {
        ...newWarehouseStocks[index],
        [field]: value,
      };

      if (field === 'warehouseId') {
        const isDuplicate = newWarehouseStocks.some(
          (ws, i) => i !== index && ws.warehouseId === value
        );
        if (isDuplicate) {
          setError(
            WAREHOUSE_TEXTS.articles.form.errors.warehouseAlreadyAssigned
          );
          return prev;
        }
      }

      setError(null);
      return {
        ...prev,
        warehouseArticles: newWarehouseStocks,
      };
    });
  };

  const addWarehouseStock = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      warehouseArticles: [
        ...prev.warehouseArticles,
        { warehouseId: 0, articleId: 0, stock: 0 },
      ],
    }));
  };

  const removeWarehouseStock = (index: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => ({
      ...prev,
      warehouseArticles: prev.warehouseArticles.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (_: any, i: number) => i !== index
      ),
    }));
  };

  const handleCreateBrand = async () => {
    if (!newBrand.name.trim()) return;

    setCreatingBrand(true);
    try {
      const createdBrand = await createBrand({
        ...newBrand,
        id: 0, // El backend asignará el ID real
      } as Brand);

      // Actualizar la lista de marcas
      await refreshBrands();
      setFormData((prev: typeof formData) => ({
        ...prev,
        brandId: createdBrand.id,
      }));

      setShowBrandModal(false);
      setNewBrand({
        name: '',
        imageUrl: '',
      });
    } catch (error) {
      console.error(error);
      setError('Error al crear la marca');
    } finally {
      setCreatingBrand(false);
    }
  };

  useEffect(() => {
    if (isEditing && article) {
      const [line, lineId] = article.line.replace(/\s+/g, '').split('-');
      const [shelf, shelfId] = article.shelf.replace(/\s+/g, '').split('-');
      const shelfName = shelf.replace(COMMON_TEXTS.group, '');
      setFormData({
        ...article,
        brandId: article.brand.id,
        line,
        shelf: shelfName,
        lineId,
        shelfId,
        warehouseArticles: article.warehouseArticles.map(
          (warehouseStock: WarehouseStock) => ({
            warehouseId: warehouseStock.warehouse.id,
            stock: warehouseStock.stock,
          })
        ),
      });
    }
  }, [isEditing, article, setFormData]);

  if (loading || loadingArticle) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing
            ? WAREHOUSE_TEXTS.articles.form.title.edit
            : WAREHOUSE_TEXTS.articles.form.title.create}
        </h2>
        <button
          onClick={() => navigate(ROUTES.WAREHOUSE_ARTICLES)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800"
        >
          ← {COMMON_TEXTS.back}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
      >
        {error && (
          <div className="p-4 text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormInput
                  id="code"
                  name="code"
                  label={WAREHOUSE_TEXTS.articles.form.fields.code}
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <FormInput
                  id="name"
                  name="name"
                  label={WAREHOUSE_TEXTS.articles.form.fields.name}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <FormSelect
                  id="unitOfMeasure"
                  name="unitOfMeasure"
                  label={WAREHOUSE_TEXTS.articles.form.fields.unitOfMeasure}
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una unidad de medida</option>
                  {UNITS_OF_MEASURE.map(unit => (
                    <option key={unit.code} value={unit.code}>
                      {unit.name}
                    </option>
                  ))}
                </FormSelect>
              </div>

              <div>
                <FormSelect
                  id="type"
                  name="type"
                  label={WAREHOUSE_TEXTS.articles.form.fields.type}
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="NUEVO">Nuevo</option>
                  <option value="REPARADO">Reparado</option>
                  <option value="CUSTODIA">Custodia</option>
                </FormSelect>
              </div>

              <div className="flex flex-col gap-2">
                <FormSelect
                  id="line"
                  name="line"
                  label={WAREHOUSE_TEXTS.articles.form.fields.line}
                  value={formData.line}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una línea</option>
                  {UNIQUE_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </FormSelect>

                <FormSelect
                  id="lineId"
                  name="lineId"
                  value={formData.lineId}
                  onChange={handleChange}
                  required
                >
                  {ALPHABET.map(letter => (
                    <option key={letter} value={letter}>
                      {letter}
                    </option>
                  ))}
                </FormSelect>
              </div>

              <div>
                <FormSelect
                  id="shelf"
                  name="shelf"
                  label={WAREHOUSE_TEXTS.articles.form.fields.shelf}
                  value={formData.shelf}
                  onChange={handleChange}
                  required
                >
                  {ALPHABET.map(letter => (
                    <option key={letter} value={letter}>
                      {COMMON_TEXTS.group} {letter}
                    </option>
                  ))}
                </FormSelect>

                <FormSelect
                  id="shelfId"
                  name="shelfId"
                  value={formData.shelfId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una línea</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num.toString()}>
                      {num}
                    </option>
                  ))}
                </FormSelect>
              </div>

              <div>
                <FormSelect
                  id="rotationClassification"
                  name="rotationClassification"
                  label={
                    WAREHOUSE_TEXTS.articles.form.fields.rotationClassification
                  }
                  value={formData.rotationClassification}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Selecciona una clasificación de rotación
                  </option>
                  {ROTATION_CLASSIFICATIONS.map(classification => (
                    <option key={classification} value={classification}>
                      {classification}
                    </option>
                  ))}
                </FormSelect>
              </div>

              <div>
                <FormInput
                  id="minStock"
                  name="minStock"
                  label={WAREHOUSE_TEXTS.articles.form.fields.minStock}
                  value={formData.minStock}
                  onChange={handleChange}
                  required
                  type="number"
                />
              </div>

              <div>
                <FormInput
                  id="maxStock"
                  name="maxStock"
                  label={WAREHOUSE_TEXTS.articles.form.fields.maxStock}
                  value={formData.maxStock}
                  onChange={handleChange}
                  required
                  type="number"
                />
              </div>

              <div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FormSelect
                      id="brandId"
                      name="brandId"
                      label={WAREHOUSE_TEXTS.articles.form.fields.brand}
                      value={formData.brandId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona una marca</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </FormSelect>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBrandModal(true)}
                    className="mb-2 p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-white dark:bg-gray-800 rounded-md"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <FormCheckbox
                  id="active"
                  name="active"
                  label={WAREHOUSE_TEXTS.articles.form.fields.active}
                  checked={formData.active}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="w-96 border-l border-gray-200 dark:border-gray-700 pl-6">
            <div className="flex justify-center mb-6">
              <ImagePreview
                imageUrl={formData.imageUrl}
                onChange={file => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setFormData((prev: any) => ({
                      ...prev,
                      imageUrl: reader.result as string,
                    }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {WAREHOUSE_TEXTS.articles.form.fields.warehouseArticles}
              </h3>
              <button
                type="button"
                disabled={
                  formData.warehouseArticles.length >=
                  (warehouses?.data?.length ?? 0)
                }
                onClick={addWarehouseStock}
                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {WAREHOUSE_TEXTS.articles.form.buttons.addWarehouse}
              </button>
            </div>

            <div className="space-y-4">
              {formData.warehouseArticles.map(
                (warehouseStock: WarehouseStockCreate, index: number) => (
                  <div key={index} className="flex items-end gap-4">
                    <div className="flex-1">
                      <FormSelect
                        id={`warehouse-${index}`}
                        name={`warehouse-${index}`}
                        label={WAREHOUSE_TEXTS.articles.form.fields.warehouse}
                        value={warehouseStock.warehouseId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          handleWarehouseStockChange(
                            index,
                            'warehouseId',
                            Number(e.target.value)
                          )
                        }
                        required
                      >
                        <option value="">
                          {WAREHOUSE_TEXTS.articles.form.fields.selectWarehouse}
                        </option>
                        {warehouses?.data?.map((warehouse: Warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <div className="flex-1">
                      <FormInput
                        id={`stock-${index}`}
                        name={`stock-${index}`}
                        label={WAREHOUSE_TEXTS.articles.form.fields.stock}
                        value={warehouseStock.stock}
                        onChange={e =>
                          handleWarehouseStockChange(
                            index,
                            'stock',
                            Number(e.target.value)
                          )
                        }
                        type="number"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWarehouseStock(index)}
                      className="mb-2 p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-white dark:bg-gray-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.WAREHOUSE_ARTICLES)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {COMMON_TEXTS.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? COMMON_TEXTS.loading : COMMON_TEXTS.save}
          </button>
        </div>
      </form>

      <Modal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        title="Crear nueva marca"
      >
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <ImagePreview
              imageUrl={newBrand.imageUrl}
              onChange={file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setNewBrand(prev => ({
                    ...prev,
                    imageUrl: reader.result as string,
                  }));
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>
          <FormInput
            id="brandName"
            name="name"
            label="Nombre de la marca"
            value={newBrand.name}
            onChange={e =>
              setNewBrand(prev => ({
                ...prev,
                name: e.target.value,
              }))
            }
            required
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowBrandModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {COMMON_TEXTS.cancel}
            </button>
            <button
              type="button"
              onClick={handleCreateBrand}
              disabled={creatingBrand || !newBrand.name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingBrand ? COMMON_TEXTS.loading : COMMON_TEXTS.save}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
