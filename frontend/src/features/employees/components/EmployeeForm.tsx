import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EMPLOYEES_TEXTS } from '../../../config/texts';
import type { Employee } from '../../../types/employee';
import { useEmployee } from '../hooks/useEmployee';
import { FormInput } from '../../../components/common/FormInput';

export const EmployeeForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEditing = Boolean(params.id);
  const employeeId = params.id ? Number(params.id) : undefined;

  const { employee, loading: loadingEmployee, error: errorEmployee } = useEmployee(employeeId);

  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    firstName: '',
    lastName: '',
    position: '',
    phone: '',
    role: '',
    active: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cuando se edita y se carga el empleado, setear los datos en el formulario
  useEffect(() => {
    if (isEditing && employee) {
      setFormData(employee);
    }
  }, [isEditing, employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // TODO: Implementar lógica de guardado
      console.log('Guardando empleado:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación de API
      navigate('/employees');
    } catch {
      setError('Error al guardar el empleado');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (isEditing && loadingEmployee) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">{EMPLOYEES_TEXTS.loading}</div>;
  }

  if (isEditing && errorEmployee) {
    return <div className="p-8 text-center text-red-500 dark:text-red-400">{errorEmployee}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? EMPLOYEES_TEXTS.form.title.edit : EMPLOYEES_TEXTS.form.title.create}
        </h2>
        <button
          onClick={() => navigate('/employees')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← {EMPLOYEES_TEXTS.form.buttons.back}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {error && (
          <div className="p-4 text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-400 rounded-md">
            {EMPLOYEES_TEXTS.form.errors.save}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormInput
              id="firstName"
              name="firstName"
              label={EMPLOYEES_TEXTS.form.fields.firstName}
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInput
              id="lastName"
              name="lastName"
              label={EMPLOYEES_TEXTS.form.fields.lastName}
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInput
              id="position"
              name="position"
              label={EMPLOYEES_TEXTS.form.fields.position}
              value={formData.position}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInput
              id="phone"
              name="phone"
              label={EMPLOYEES_TEXTS.form.fields.phone}
              value={formData.phone}
              onChange={handleChange}
              required
              type="tel"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {EMPLOYEES_TEXTS.form.fields.role}
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3 h-10"
            >
              <option value="">{EMPLOYEES_TEXTS.form.select.role.placeholder}</option>
              <option value="Administrador">{EMPLOYEES_TEXTS.form.select.role.options.admin}</option>
              <option value="Supervisor">{EMPLOYEES_TEXTS.form.select.role.options.supervisor}</option>
              <option value="Usuario">{EMPLOYEES_TEXTS.form.select.role.options.user}</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {EMPLOYEES_TEXTS.form.fields.active}
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {EMPLOYEES_TEXTS.form.buttons.cancel}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? EMPLOYEES_TEXTS.form.buttons.saving : EMPLOYEES_TEXTS.form.buttons.save}
          </button>
        </div>
      </form>
    </div>
  );
}; 