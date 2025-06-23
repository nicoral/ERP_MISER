import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EMPLOYEES_TEXTS } from '../../../config/texts';
import type { CreateEmployee } from '../../../types/employee';
import {
  useEmployee,
  useCreateEmployee,
  useUpdateEmployee,
  useUploadEmployeeImage,
} from '../hooks/useEmployees';
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
import { FormSelect } from '../../../components/common/FormSelect';

export const EmployeeForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEditing = Boolean(params.id);
  const [selectedEmployeeImage, setSelectedEmployeeImage] =
    useState<File | null>(null);
  const employeeId = params.id ? Number(params.id) : undefined;

  const { data: employee, isLoading: loadingEmployee } =
    useEmployee(employeeId);
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const uploadImageMutation = useUploadEmployeeImage();

  const { data: warehouses, isLoading: loadingWarehouses } = useWarehouses(
    1,
    1000
  );
  const { roles, loading: loadingRoles, error: errorRoles } = useRoles();

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

  const [error, setError] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

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
    setError(null);

    try {
      const submitData = {
        ...formData,
        warehousesAssigned: selectedValues.map(Number),
      };

      if (isEditing && employeeId) {
        await updateEmployeeMutation.mutateAsync({
          id: employeeId,
          data: submitData,
        });
      } else {
        const newEmployee =
          await createEmployeeMutation.mutateAsync(submitData);

        // Si hay imagen seleccionada, subirla después de crear el empleado
        if (selectedEmployeeImage && newEmployee) {
          await uploadImageMutation.mutateAsync({
            id: newEmployee.id,
            file: selectedEmployeeImage,
          });
        }
      }

      navigate(ROUTES.EMPLOYEES);
    } catch (error) {
      console.error(error);
      setError(
        isEditing
          ? EMPLOYEES_TEXTS.form.errors.update
          : EMPLOYEES_TEXTS.form.errors.save
      );
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

  const isLoading =
    loadingEmployee ||
    loadingWarehouses ||
    loadingRoles ||
    createEmployeeMutation.isPending ||
    updateEmployeeMutation.isPending ||
    uploadImageMutation.isPending;

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex justify-center items-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (isEditing && errorRoles) {
    return (
      <div className="p-8 text-center text-red-500 dark:text-red-400">
        {errorRoles}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:mb-6 mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing
            ? EMPLOYEES_TEXTS.form.title.edit
            : EMPLOYEES_TEXTS.form.title.create}
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
              <option value="">Selecciona tipo de documento</option>
              {DOCUMENT_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
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
              type="email"
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
            />
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
              <option value="">Selecciona posición</option>
              {EMPLOYEES_POSITIONS.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <FormSelect
              id="area"
              name="area"
              label={EMPLOYEES_TEXTS.form.fields.area}
              value={formData.area || ''}
              onChange={handleChange}
            >
              <option value="">Selecciona área</option>
              {EMPLOYEES_AREAS.map(area => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <FormSelect
              id="role"
              name="role"
              label={EMPLOYEES_TEXTS.form.fields.role}
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loadingRoles}
            >
              <option value="">Selecciona rol</option>
              {roles?.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </FormSelect>
          </div>

          <div>
            <FormInputDate
              id="hireDate"
              name="hireDate"
              label={EMPLOYEES_TEXTS.form.fields.hireDate}
              value={
                formData.hireDate instanceof Date
                  ? formData.hireDate.toISOString().split('T')[0]
                  : ''
              }
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
                formData.birthDate instanceof Date
                  ? formData.birthDate.toISOString().split('T')[0]
                  : ''
              }
              onChange={handleChange}
            />
          </div>

          <div>
            <FormInputDate
              id="dischargeDate"
              name="dischargeDate"
              label={EMPLOYEES_TEXTS.form.fields.dischargeDate}
              value={
                formData.dischargeDate instanceof Date
                  ? formData.dischargeDate.toISOString().split('T')[0]
                  : ''
              }
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <FormInput
              id="address"
              name="address"
              label={EMPLOYEES_TEXTS.form.fields.address}
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <MultiSelect
              label={EMPLOYEES_TEXTS.form.fields.warehousesAssigned}
              options={
                warehouses?.data?.map(warehouse => ({
                  value: warehouse.id.toString(),
                  label: warehouse.name,
                })) || []
              }
              value={selectedValues}
              onChange={setSelectedValues}
            />
          </div>

          <div className="md:col-span-2">
            <FormCheckbox
              id="active"
              name="active"
              label={EMPLOYEES_TEXTS.form.fields.active}
              checked={formData.active}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <ImagePreview
              imageUrl={employee?.imageUrl || ''}
              onChange={file => {
                setSelectedEmployeeImage(file);
              }}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.EMPLOYEES)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};
