import { FormCheckbox } from '../../../components/common/FormCheckbox';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { COMMON_TEXTS, WAREHOUSE_TEXTS } from '../../../config/texts';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { WarehouseCreate } from '../../../types/warehouse';
import { FormInput } from '../../../components/common/FormInput';
import { FormInputDate } from '../../../components/common/FormInputDate';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import {
  useWarehouse,
  useWarehouseCreate,
  useWarehouseUpdate,
} from '../hooks/useWarehouse';
import { ROUTES } from '../../../config/constants';
import { useEmployeesSimple } from '../../../hooks/useEmployeeService';

export const WarehouseForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEditing = Boolean(params.id);
  const warehouseId = params.id ? Number(params.id) : undefined;
  const {
    data: warehouse,
    isLoading: loadingWarehouse,
    error: errorWarehouse,
  } = useWarehouse(warehouseId);

  const { mutate: createWarehouse } = useWarehouseCreate();
  const { mutate: updateWarehouse } = useWarehouseUpdate();
  const [formData, setFormData] = useState<WarehouseCreate>({
    name: '',
    address: '',
    hireDate: new Date(),
    dismissalDate: null,
    active: true,
    valued: 0,
    employeeId: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    data: employees,
    isLoading: loadingEmployees,
    error: errorEmployees,
  } = useEmployeesSimple('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await updateWarehouse({
          id: warehouseId ?? -1,
          data: formData,
        });
      } else {
        createWarehouse(formData);
      }
      navigate(ROUTES.WAREHOUSE);
    } catch {
      setError('Error al guardar el almacén');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  useEffect(() => {
    if (isEditing && warehouse) {
      setFormData({ ...warehouse, employeeId: warehouse.manager.id });
    }
  }, [isEditing, warehouse, setFormData]);

  if (isEditing && (loadingWarehouse || loadingEmployees || loading)) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (isEditing && (errorWarehouse || errorEmployees)) {
    return (
      <div className="p-8 text-center text-red-500 dark:text-red-400">
        {errorWarehouse?.message || errorEmployees?.message}
      </div>
    );
  }

  // Preparar las opciones para el SearchableSelect
  const employeeOptions =
    employees?.map(employee => ({
      value: employee.id,
      label: `${employee.firstName} ${employee.lastName}`,
    })) || [];

  return (
    <div className="max-w-2xl mx-auto p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:mb-6 mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing
            ? WAREHOUSE_TEXTS.form.title.edit
            : WAREHOUSE_TEXTS.form.title.create}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
      >
        {error && (
          <div className="p-4 text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-400 rounded-md">
            {WAREHOUSE_TEXTS.form.errors.save}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormInput
              id="name"
              name="name"
              label={WAREHOUSE_TEXTS.form.fields.name}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInput
              id="address"
              name="address"
              label={WAREHOUSE_TEXTS.form.fields.address}
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInput
              id="valued"
              name="valued"
              label={WAREHOUSE_TEXTS.form.fields.valued}
              value={formData.valued}
              onChange={handleChange}
              required
              type="number"
            />
          </div>

          <div>
            <FormInputDate
              id="hireDate"
              name="hireDate"
              label={WAREHOUSE_TEXTS.form.fields.hireDate}
              value={new Date(formData.hireDate).toISOString().split('T')[0]}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInputDate
              id="dismissalDate"
              name="dismissalDate"
              label={WAREHOUSE_TEXTS.form.fields.dismissalDate}
              value={
                formData.dismissalDate
                  ? new Date(formData.dismissalDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={handleChange}
            />
          </div>

          <div>
            <SearchableSelect
              id="employee"
              name="employeeId"
              label={WAREHOUSE_TEXTS.form.fields.employee}
              value={formData.employeeId}
              onChange={handleChange}
              options={employeeOptions}
              placeholder={WAREHOUSE_TEXTS.form.select.employee.placeholder}
              required
              disabled={loadingEmployees}
            />
          </div>

          <div className="flex items-center">
            <FormCheckbox
              id="active"
              name="active"
              label={WAREHOUSE_TEXTS.form.fields.active}
              checked={formData.active}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.WAREHOUSE)}
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
