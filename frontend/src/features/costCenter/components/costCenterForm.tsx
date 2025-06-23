import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormInput } from '../../../components/common/FormInput';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { COMMON_TEXTS, COST_CENTER_TEXTS } from '../../../config/texts';
import { ROUTES } from '../../../config/constants';
import type {
  CreateCostCenter,
  UpdateCostCenter,
} from '../../../types/costCenter';
import {
  useCostCenter,
  useCreateCostCenter,
  useUpdateCostCenter,
} from '../hooks/useCostCenter';

interface FormData {
  description: string;
  code: string;
  serial: string;
  codeMine: string;
  children: CreateCostCenter[];
}

export const CostCenterForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEditing = Boolean(params.id);
  const costCenterId = params.id ? Number(params.id) : undefined;

  const { data: costCenter, isLoading: loadingCostCenter } =
    useCostCenter(costCenterId);
  const createCostCenterMutation = useCreateCostCenter();
  const updateCostCenterMutation = useUpdateCostCenter();

  const [formData, setFormData] = useState<FormData>({
    description: '',
    code: '',
    serial: '',
    codeMine: '',
    children: [],
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = {
        ...formData,
        children: formData.children.length > 0 ? formData.children : [],
      };

      if (isEditing && costCenterId) {
        await updateCostCenterMutation.mutateAsync({
          id: costCenterId,
          data: submitData as UpdateCostCenter,
        });
      } else {
        await createCostCenterMutation.mutateAsync(
          submitData as CreateCostCenter
        );
      }
      navigate(ROUTES.COST_CENTER);
    } catch {
      setError(COST_CENTER_TEXTS.form.errors.save);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children: [
        ...prev.children,
        {
          description: '',
          code: '',
          serial: '',
          codeMine: '',
          children: [],
        },
      ],
    }));
  };

  const removeChild = (index: number) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index),
    }));
  };

  const updateChild = (
    index: number,
    field: keyof CreateCostCenter,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      ),
    }));
  };

  useEffect(() => {
    if (isEditing && costCenter) {
      setFormData({
        description: costCenter.description,
        code: costCenter.code || '',
        serial: costCenter.serial || '',
        codeMine: costCenter.codeMine || '',
        children:
          costCenter.children?.map(child => ({
            id: child.id,
            description: child.description,
            code: child.code || '',
            serial: child.serial || '',
            codeMine: child.codeMine || '',
          })) || [],
      });
    }
  }, [isEditing, costCenter]);

  const isLoading =
    loadingCostCenter ||
    createCostCenterMutation.isPending ||
    updateCostCenterMutation.isPending;

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:mb-6 mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing
            ? COST_CENTER_TEXTS.form.title.edit
            : COST_CENTER_TEXTS.form.title.create}
        </h2>
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

        <div className="space-y-6">
          <FormInput
            id="description"
            name="description"
            label={COST_CENTER_TEXTS.form.fields.description}
            value={formData.description}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              id="code"
              name="code"
              label="Código"
              value={formData.code}
              onChange={handleChange}
            />

            <FormInput
              id="serial"
              name="serial"
              label="Serial"
              value={formData.serial}
              onChange={handleChange}
            />

            <FormInput
              id="codeMine"
              name="codeMine"
              label="Código Mina"
              value={formData.codeMine}
              onChange={handleChange}
            />
          </div>

          {/* Sección de centros de costo secundarios */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Centros de Costos Secundarios
              </h3>
              <button
                type="button"
                onClick={addChild}
                className="px-3 py-1 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Agregar Centro de Costo Secundario
              </button>
            </div>

            {formData.children.map((child, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Centro de costo secundario {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeChild(index)}
                    className="bg-transparent px-2 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Eliminar
                  </button>
                </div>

                <FormInput
                  id={`child-${index}-description`}
                  name="description"
                  label="Descripción"
                  value={child.description}
                  onChange={e =>
                    updateChild(index, 'description', e.target.value)
                  }
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    id={`child-${index}-code`}
                    name="code"
                    label="Código"
                    value={child.code}
                    onChange={e => updateChild(index, 'code', e.target.value)}
                  />

                  <FormInput
                    id={`child-${index}-serial`}
                    name="serial"
                    label="Serial"
                    value={child.serial}
                    onChange={e => updateChild(index, 'serial', e.target.value)}
                  />

                  <FormInput
                    id={`child-${index}-codeMine`}
                    name="codeMine"
                    label="Código Mina"
                    value={child.codeMine}
                    onChange={e =>
                      updateChild(index, 'codeMine', e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.COST_CENTER)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {COMMON_TEXTS.cancel}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : COMMON_TEXTS.save}
          </button>
        </div>
      </form>
    </div>
  );
};
