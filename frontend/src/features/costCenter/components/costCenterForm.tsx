import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormInput } from '../../../components/common/FormInput';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { COMMON_TEXTS, COST_CENTER_TEXTS } from '../../../config/texts';
import { ROUTES } from '../../../config/constants';
import {
  createCostCenter,
  updateCostCenter,
} from '../../../services/api/costCenterService';
import type {
  CreateCostCenter,
  UpdateCostCenter,
} from '../../../types/costCenter';
import { useCostCenter } from '../hooks/useCostCenter';

interface FormData {
  name: string;
  description: string;
}

export const CostCenterForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEditing = Boolean(params.id);
  const costCenterId = params.id ? Number(params.id) : undefined;

  const { costCenter, loading: loadingCostCenter } = useCostCenter(
    costCenterId ?? 0
  );

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await updateCostCenter(costCenterId ?? 0, formData as UpdateCostCenter);
      } else {
        await createCostCenter(formData as CreateCostCenter);
      }
      navigate(ROUTES.COST_CENTER);
    } catch {
      setError(COST_CENTER_TEXTS.form.errors.save);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    if (isEditing && costCenter) {
      setFormData({
        name: costCenter.name,
        description: costCenter.description,
      });
    }
  }, [isEditing, costCenter]);

  if (loading || loadingCostCenter) {
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
            id="name"
            name="name"
            label={COST_CENTER_TEXTS.form.fields.name}
            value={formData.name}
            onChange={handleChange}
            required
          />

          <FormInput
            id="description"
            name="description"
            label={COST_CENTER_TEXTS.form.fields.description}
            value={formData.description}
            onChange={handleChange}
            type="textarea"
          />
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
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? COMMON_TEXTS.loading : COMMON_TEXTS.save}
          </button>
        </div>
      </form>
    </div>
  );
};
