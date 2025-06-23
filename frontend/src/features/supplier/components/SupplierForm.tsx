import { FormCheckbox } from '../../../components/common/FormCheckbox';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { COMMON_TEXTS, WAREHOUSE_TEXTS } from '../../../config/texts';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FormInput } from '../../../components/common/FormInput';
import { ROUTES, UNIQUE_CATEGORIES } from '../../../config/constants';
import {
  useSupplier,
  useCreateSupplier,
  useUpdateSupplier,
} from '../hooks/useSupplier';
import { SupplierStatus, type Supplier } from '../../../types/supplier';
import { FormSelect } from '../../../components/common/FormSelect';
import { MultiSelect } from '../../../components/common/MultiSelect';

interface FormData {
  ruc: string;
  businessName: string;
  address: string;
  contactPerson: string;
  mobile: string;
  email: string;
  bankAccount: string;
  returnPolicy: boolean;
  rating: number;
  status: SupplierStatus;
  lines: string[];
}

export const SupplierForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isEditing = Boolean(params.id);
  const supplierId = params.id ? Number(params.id) : undefined;

  const { data: supplier, isLoading: loadingSupplier } = useSupplier(
    supplierId
  );
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();

  const [formData, setFormData] = useState<FormData>({
    ruc: '',
    businessName: '',
    address: '',
    contactPerson: '',
    mobile: '',
    email: '',
    bankAccount: '',
    returnPolicy: false,
    rating: 0,
    status: SupplierStatus.ACTIVE,
    lines: [],
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = {
        ...formData,
        lines: formData.lines.join('-'),
      } as Omit<Supplier, 'id'>;

      if (isEditing && supplierId) {
        await updateSupplierMutation.mutateAsync({
          id: supplierId,
          data: submitData,
        });
      } else {
        await createSupplierMutation.mutateAsync(submitData);
      }
      navigate(ROUTES.SUPPLIERS);
    } catch {
      setError(WAREHOUSE_TEXTS.suppliers.form.errors.save);
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
    if (isEditing && supplier) {
      setFormData({
        ruc: supplier.ruc,
        businessName: supplier.businessName,
        address: supplier.address ?? '',
        contactPerson: supplier.contactPerson,
        mobile: supplier.mobile,
        email: supplier.email ?? '',
        bankAccount: supplier.bankAccount ?? '',
        returnPolicy: supplier.returnPolicy,
        rating: supplier.rating,
        status: supplier.status,
        lines: supplier.lines?.split('-') ?? [],
      });
    }
  }, [isEditing, supplier]);

  const isLoading =
    loadingSupplier ||
    createSupplierMutation.isPending ||
    updateSupplierMutation.isPending;

  if (isLoading) {
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
            ? WAREHOUSE_TEXTS.suppliers.form.title.edit
            : WAREHOUSE_TEXTS.suppliers.form.title.create}
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
              id="ruc"
              name="ruc"
              label={WAREHOUSE_TEXTS.suppliers.form.fields.ruc}
              value={formData.ruc}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInput
              id="businessName"
              name="businessName"
              label={WAREHOUSE_TEXTS.suppliers.form.fields.business_name}
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInput
              id="address"
              name="address"
              label={WAREHOUSE_TEXTS.suppliers.form.fields.address}
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <FormInput
              id="contactPerson"
              name="contactPerson"
              label={WAREHOUSE_TEXTS.suppliers.form.fields.contact_person}
              value={formData.contactPerson}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInput
              id="mobile"
              name="mobile"
              label={WAREHOUSE_TEXTS.suppliers.form.fields.mobile}
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <FormInput
              id="email"
              name="email"
              label={WAREHOUSE_TEXTS.suppliers.form.fields.email}
              value={formData.email}
              onChange={handleChange}
              type="email"
            />
          </div>

          <div>
            <FormInput
              id="bankAccount"
              name="bankAccount"
              label={WAREHOUSE_TEXTS.suppliers.form.fields.bank_account}
              value={formData.bankAccount}
              onChange={handleChange}
            />
          </div>

          <div>
            <FormSelect
              name="status"
              label={WAREHOUSE_TEXTS.suppliers.form.fields.status}
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value={SupplierStatus.ACTIVE}>
                {WAREHOUSE_TEXTS.suppliers.table.status.active}
              </option>
              <option value={SupplierStatus.INACTIVE}>
                {WAREHOUSE_TEXTS.suppliers.table.status.inactive}
              </option>
              <option value={SupplierStatus.BLACKLISTED}>
                {WAREHOUSE_TEXTS.suppliers.table.status.blacklisted}
              </option>
            </FormSelect>
          </div>

          <div>
            <FormInput
              id="rating"
              name="rating"
              label={WAREHOUSE_TEXTS.suppliers.form.fields.rating}
              value={formData.rating}
              onChange={handleChange}
              type="number"
              min="0"
              max="5"
              step="0.1"
            />
          </div>

          <div className="md:col-span-2">
            <MultiSelect
              label={WAREHOUSE_TEXTS.suppliers.form.fields.categories}
              options={UNIQUE_CATEGORIES.map(category => ({
                value: category,
                label: category,
              }))}
              value={formData.lines}
              onChange={selectedLines =>
                setFormData(prev => ({ ...prev, lines: selectedLines }))
              }
            />
          </div>

          <div className="md:col-span-2">
            <FormCheckbox
              id="returnPolicy"
              name="returnPolicy"
              label={WAREHOUSE_TEXTS.suppliers.form.fields.return_policy}
              checked={formData.returnPolicy}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPPLIERS)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {COMMON_TEXTS.cancel}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? COMMON_TEXTS.loading : COMMON_TEXTS.save}
          </button>
        </div>
      </form>
    </div>
  );
};
