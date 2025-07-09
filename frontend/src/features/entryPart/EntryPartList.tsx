import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../components/common/Table';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '../../components/common/Icons';
import { useState } from 'react';
import { ROUTES } from '../../config/constants';

export type EntryPartStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export interface EntryPart {
  id: number;
  code: string;
  date: string;
  receptionist: string;
  status: EntryPartStatus;
}

// Dummy data for now
const DUMMY_DATA: EntryPart[] = [
  {
    id: 1,
    code: 'ENT-001',
    date: '2024-06-01',
    receptionist: 'Juan Pérez',
    status: 'PENDING',
  },
  {
    id: 2,
    code: 'ENT-002',
    date: '2024-06-02',
    receptionist: 'Ana López',
    status: 'RECEIVED',
  },
  {
    id: 3,
    code: 'ENT-003',
    date: '2024-06-03',
    receptionist: 'Carlos Ruiz',
    status: 'CANCELLED',
  },
];

const statusColor = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  RECEIVED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const EntryPartList = () => {
  const navigate = useNavigate();
  const [data] = useState<EntryPart[]>(DUMMY_DATA);

  const handleView = (entry: EntryPart) => {
    navigate(
      `${ROUTES.ENTRY_PART_DETAILS}`.replace(':id', entry.id.toString())
    );
  };

  const columns: TableColumn<EntryPart>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Código', accessor: 'code' },
    { header: 'Fecha', accessor: 'date' },
    { header: 'Recepcionista', accessor: 'receptionist' },
    {
      header: 'Estado',
      accessor: 'status',
      render: (entry: EntryPart) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor[entry.status]}`}
        >
          {entry.status}
        </span>
      ),
    },
  ];

  const actions: TableAction<EntryPart>[] = [
    {
      icon: <EyeIcon className="w-5 h-5 text-green-600" />,
      label: 'Ver detalles',
      onClick: handleView,
    },
  ];

  return (
    <div className="sm:p-8 p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
          Partes de Ingreso
        </h2>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-fit"
          onClick={() => navigate(ROUTES.ENTRY_PART_CREATE)}
        >
          Nueva Parte de Ingreso
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table<EntryPart>
          columns={columns}
          data={data}
          keyField="id"
          actions={actions}
          pageSize={10}
        />
      </div>
    </div>
  );
};
