import React, { useState } from 'react';
import { WAREHOUSE_TEXTS } from '../../../config/texts';
import { EyeIcon, EditIcon, TrashIcon } from '../../../components/common/Icons';
import { FormInput } from '../../../components/common/FormInput';
import {
  Table,
  type TableAction,
  type TableColumn,
} from '../../../components/common/Table';
import {
  SupplierStatus,
  type Supplier,
  type SupplierFilters,
} from '../../../types/supplier';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { Modal } from '../../../components/common/Modal';
import { SupplierDetails } from './SupplierDetails';
import { useSuppliers, useDeleteSupplier } from '../hooks/useSupplier';
import { hasPermission } from '../../../utils/permissions';
import { useToast } from '../../../contexts/ToastContext';

export const SupplierList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const deleteSupplierMutation = useDeleteSupplier();

  const [filters, setFilters] = useState<SupplierFilters>({
    code: '',
    name: '',
    contact: '',
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );

  // Hook con datos y estados automáticos de React Query
  const { data, isLoading, isFetching } = useSuppliers(page, 10, filters);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ code: '', name: '', contact: '' });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > (data?.totalPages ?? 1)) return;
    setPage(newPage);
  };

  const handleCreate = () => navigate(ROUTES.SUPPLIERS_CREATE);
  const handleEdit = (id: number) =>
    navigate(ROUTES.SUPPLIERS_EDIT.replace(':id', id.toString()));

  const handleDelete = async (supplier: Supplier) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el proveedor ${supplier.businessName}?`
      )
    ) {
      try {
        await deleteSupplierMutation.mutateAsync(supplier.id);
        showSuccess(
          'Eliminado',
          `Proveedor ${supplier.businessName} eliminado correctamente`
        );
      } catch {
        showError('Error', 'No se pudo eliminar el proveedor');
      }
    }
  };

  const getStatusDisplay = (status: SupplierStatus) => {
    const statusConfig = {
      [SupplierStatus.ACTIVE]: {
        text: WAREHOUSE_TEXTS.suppliers.table.status.active,
        className:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      },
      [SupplierStatus.INACTIVE]: {
        text: WAREHOUSE_TEXTS.suppliers.table.status.inactive,
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      },
      [SupplierStatus.BLACKLISTED]: {
        text: WAREHOUSE_TEXTS.suppliers.table.status.blacklisted,
        className:
          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  const columns: TableColumn<Supplier>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'RUC', accessor: 'ruc' },
    { header: 'Razón Social', accessor: 'businessName' },
    { header: 'Persona de Contacto', accessor: 'contactPerson' },
    { header: 'Teléfono', accessor: 'mobile' },
    {
      header: 'Email',
      accessor: 'email',
      render: supplier => supplier.email || '-',
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: supplier => getStatusDisplay(supplier.status),
    },
  ];

  const actions: TableAction<Supplier>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: 'Ver Detalles',
      onClick: (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setShowDetailsModal(true);
      },
    },
    ...(hasPermission('update_suppliers')
      ? [
          {
            icon: <EditIcon className="w-5 h-5 text-blue-600" />,
            label: 'Editar',
            onClick: (supplier: Supplier) => handleEdit(supplier.id),
          },
        ]
      : []),
    ...(hasPermission('delete_suppliers')
      ? [
          {
            icon: <TrashIcon className="w-5 h-5 text-red-600" />,
            label: 'Eliminar',
            onClick: (supplier: Supplier) => handleDelete(supplier),
          },
        ]
      : []),
  ];

  return (
    <div className="sm:p-8 p-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {WAREHOUSE_TEXTS.suppliers.title}
        </h2>
        {hasPermission('create_suppliers') && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 w-fit"
          >
            {WAREHOUSE_TEXTS.suppliers.buttons.create}
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex justify-between w-full text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md"
        >
          <span>{WAREHOUSE_TEXTS.suppliers.filters.title}</span>
          <svg
            className={`w-5 h-5 transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                id="code"
                name="code"
                label={WAREHOUSE_TEXTS.suppliers.filters.code}
                value={filters.code}
                onChange={handleFilterChange}
                placeholder={WAREHOUSE_TEXTS.suppliers.filters.codePlaceholder}
              />
              <FormInput
                id="name"
                name="name"
                label={WAREHOUSE_TEXTS.suppliers.filters.name}
                value={filters.name}
                onChange={handleFilterChange}
                placeholder={WAREHOUSE_TEXTS.suppliers.filters.namePlaceholder}
              />
              <FormInput
                id="contact"
                name="contact"
                label={WAREHOUSE_TEXTS.suppliers.filters.contact}
                value={filters.contact}
                onChange={handleFilterChange}
                placeholder={
                  WAREHOUSE_TEXTS.suppliers.filters.contactPlaceholder
                }
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                {WAREHOUSE_TEXTS.suppliers.filters.clear}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<Supplier>
          columns={columns}
          data={data?.data ?? []}
          keyField="id"
          loading={isLoading || isFetching || deleteSupplierMutation.isPending}
          pagination={{
            page: page,
            totalPages: data?.totalPages ?? 1,
            onPageChange: handlePageChange,
          }}
          actions={actions}
          pageSize={10}
        />
      </div>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`🏢 ${selectedSupplier?.businessName ?? ''}`}
      >
        {selectedSupplier && <SupplierDetails supplier={selectedSupplier} />}
      </Modal>
    </div>
  );
};
