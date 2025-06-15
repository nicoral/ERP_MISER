import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EMPLOYEES_TEXTS } from '../../../config/texts';
import type { CreateEmployee } from '../../../types/employee';
import { useEmployee } from '../hooks/useEmployee';
import { FormInput } from '../../../components/common/FormInput';
import { FormInputDate } from '../../../components/common/FormInputDate';
import { useRoles } from '../hooks/userRoles';
import { FormCheckbox } from '../../../components/common/FormCheckbox';
import { ImagePreview } from '../../../components/common/ImagePreview';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import {
  DOCUMENT_TYPES,
  EMPLOYEES_AREAS,
  EMPLOYEES_POSITIONS,
  ROUTES,
} from '../../../config/constants';
import { MultiSelect } from '../../../components/common/MultiSelect';
import { useWarehouses } from '../../warehouse/hooks/useWarehouse';
import {
  createEmployee,
  updateEmployee,
} from '../../../services/api/employeeService';
import { FormSelect } from '../../../components/common/FormSelect';

export const EmployeeForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEditing = Boolean(params.id);
  const employeeId = params.id ? Number(params.id) : undefined;

  const {
    employee,
    loading: loadingEmployee,
    error: errorEmployee,
  } = useEmployee(employeeId);

  const { warehouses } = useWarehouses(1, 1000);

  const [formData, setFormData] = useState<CreateEmployee>({
    firstName: '',
    lastName: '',
    position: '',
    phone: '',
    email: '',
    documentId: '',
    documentType: '',
    address: '',
    imageUrl: '',
    hireDate: new Date(),
    dischargeDate: null,
    birthDate: null,
    area: null,
    role: 0,
    active: true,
    warehousesAssigned: [],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const { roles, loading: loadingRoles, error: errorRoles } = useRoles();
  useEffect(() => {
    if (isEditing && employee) {
      setFormData({
        ...employee,
        role: employee.role.id,
        warehousesAssigned: employee.warehousesAssigned.map(
          warehouse => warehouse.id
        ),
      });
      setSelectedValues(
        employee.warehousesAssigned.map(warehouse => warehouse.id.toString())
      );
    }
  }, [isEditing, employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        await updateEmployee(employeeId!, {
          ...formData,
          warehousesAssigned: selectedValues.map(Number),
        });
      } else {
        await createEmployee({
          ...formData,
          warehousesAssigned: selectedValues.map(Number),
        });
      }
      navigate(ROUTES.EMPLOYEES);
    } catch (error) {
      console.error(error);
      setError(
        isEditing
          ? EMPLOYEES_TEXTS.form.errors.update
          : EMPLOYEES_TEXTS.form.errors.save
      );
    } finally {
      setSaving(false);
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

  if (isEditing && (loadingEmployee || loadingRoles)) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (isEditing && (errorEmployee || errorRoles)) {
    return (
      <div className="p-8 text-center text-red-500 dark:text-red-400">
        {errorEmployee ?? errorRoles}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing
            ? EMPLOYEES_TEXTS.form.title.edit
            : EMPLOYEES_TEXTS.form.title.create}
        </h2>
        <button
          onClick={() => navigate(ROUTES.EMPLOYEES)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800"
        >
          ← {EMPLOYEES_TEXTS.form.buttons.back}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
      >
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
            <FormSelect
              id="documentType"
              name="documentType"
              label={EMPLOYEES_TEXTS.form.fields.documentType}
              value={formData.documentType}
              onChange={handleChange}
              required
            >
              <option value="">
                {EMPLOYEES_TEXTS.form.select.documentType.placeholder}
              </option>
              {DOCUMENT_TYPES.map(documentType => (
                <option key={documentType} value={documentType}>
                  {documentType}
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <FormInput
              id="documentId"
              name="documentId"
              label={EMPLOYEES_TEXTS.form.fields.documentId}
              value={formData.documentId}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInput
              id="email"
              name="email"
              label={EMPLOYEES_TEXTS.form.fields.email}
              value={formData.email}
              onChange={handleChange}
              required
              type="email"
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
            <FormSelect
              id="area"
              name="area"
              label={EMPLOYEES_TEXTS.form.fields.area}
              value={formData.area}
              onChange={handleChange}
              required
            >
              <option value="">
                {EMPLOYEES_TEXTS.form.select.area.placeholder}
              </option>
              {EMPLOYEES_AREAS.map(area => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <FormSelect
              id="position"
              name="position"
              label={EMPLOYEES_TEXTS.form.fields.position}
              value={formData.position}
              onChange={handleChange}
              required
            >
              <option value="">
                {EMPLOYEES_TEXTS.form.select.position.placeholder}
              </option>
              {EMPLOYEES_POSITIONS.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <FormInput
              id="address"
              name="address"
              label={EMPLOYEES_TEXTS.form.fields.address}
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInputDate
              id="birthDate"
              name="birthDate"
              label={EMPLOYEES_TEXTS.form.fields.birthDate}
              value={
                formData.birthDate
                  ? new Date(formData.birthDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInputDate
              id="hireDate"
              name="hireDate"
              label={EMPLOYEES_TEXTS.form.fields.hireDate}
              value={new Date(formData.hireDate).toISOString().split('T')[0]}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInputDate
              id="dischargeDate"
              name="dischargeDate"
              label={EMPLOYEES_TEXTS.form.fields.dischargeDate}
              value={
                formData.dischargeDate
                  ? new Date(formData.dischargeDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={handleChange}
            />
          </div>
          <div>
            <FormSelect
              id="role"
              name="role"
              label={EMPLOYEES_TEXTS.form.fields.role}
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">
                {EMPLOYEES_TEXTS.form.select.role.placeholder}
              </option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <MultiSelect
              label={EMPLOYEES_TEXTS.form.fields.warehousesAssigned}
              options={
                warehouses?.data.map(warehouse => ({
                  label: warehouse.name,
                  value: warehouse.id.toString(),
                })) ?? []
              }
              value={selectedValues}
              onChange={setSelectedValues}
            />
          </div>

          <div className="flex items-center">
            <FormCheckbox
              id="active"
              name="active"
              label={EMPLOYEES_TEXTS.form.fields.active}
              checked={formData.active}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <ImagePreview
            imageUrl={formData.imageUrl}
            onChange={file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                setFormData(prev => ({
                  ...prev,
                  imageUrl: reader.result as string,
                }));
              };
              reader.readAsDataURL(file);
            }}
          />
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
            {saving
              ? EMPLOYEES_TEXTS.form.buttons.saving
              : EMPLOYEES_TEXTS.form.buttons.save}
          </button>
        </div>
      </form>
    </div>
  );
};
