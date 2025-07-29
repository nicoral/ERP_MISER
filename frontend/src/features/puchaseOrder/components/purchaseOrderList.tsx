import { useState } from 'react';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrderService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import type { TableAction, TableColumn } from '../../../types/table';
import type { PurchaseOrder } from '../../../types/purchaseOrder';
import { EyeIcon } from '../../../components/common/Icons';
import { Table } from '../../../components/common/Table';
import { ROUTES } from '../../../config/constants';
import { useNavigate } from 'react-router-dom';

export const PurchaseOrderList = ({
  type,
}: {
  type: 'ARTICLE' | 'SERVICE';
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = usePurchaseOrders(page, 10, type);

  if (isLoading) return <LoadingSpinner />;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > (data?.totalPages ?? 1)) return;
    setPage(newPage);
  };

  const columns: TableColumn<PurchaseOrder>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Código', accessor: 'code' },
    {
      header: 'Requerimiento',
      render: (purchaseOrder: PurchaseOrder) => (
        <div>
          <button
            onClick={() => {
              const url =
                purchaseOrder.requirement?.type === 'ARTICLE'
                  ? ROUTES.REQUIREMENTS_ARTICLES_DETAILS.replace(
                      ':id',
                      purchaseOrder.requirement?.id.toString() ?? ''
                    )
                  : ROUTES.REQUIREMENTS_SERVICES_DETAILS.replace(
                      ':id',
                      purchaseOrder.requirement?.id.toString() ?? ''
                    );
              window.open(url, '_blank');
            }}
            className="bg-transparent text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors w-full"
          >
            <div className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">
              {purchaseOrder.requirement?.code}
            </div>
            <div className="text-sm text-gray-500">
              {purchaseOrder.requirement?.employee?.firstName}
            </div>
          </button>
        </div>
      ),
    },
    { header: 'Proveedor', accessor: 'supplier.businessName' },
    { header: 'Fecha de emisión', accessor: 'issueDate' },
  ];

  const actions: TableAction<PurchaseOrder>[] = [
    {
      label: 'Ver',
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      onClick: purchaseOrder =>
        navigate(
          ROUTES.PURCHASE_ORDER_DETAILS.replace(
            ':id',
            purchaseOrder.id.toString()
          )
        ),
    },
  ];

  return (
    <div className="sm:p-8 p-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ordenes de {type === 'ARTICLE' ? 'Compras' : 'Servicios'}
        </h2>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<PurchaseOrder>
          columns={columns}
          data={data?.data ?? []}
          keyField="id"
          loading={isLoading || isFetching}
          pagination={{
            page: page,
            totalPages: data?.totalPages ?? 1,
            onPageChange: handlePageChange,
          }}
          actions={actions}
          pageSize={10}
        />
      </div>
    </div>
  );
};
