import React, { useState, useEffect, useRef } from 'react';
import { useFuelControlService } from '../hooks/useFuelControl';
import type { FuelControl, FuelControlFilters } from '../types';
import { FuelControlStatus } from '../types';
import type { FuelInput } from '../types';
import { Button } from '../../../components/common/Button';
import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../../components/common/Table';
import { Card } from '../../../components/ui/card';
import { Plus, Eye, Edit, Fuel } from 'lucide-react';
import { FormInput } from '../../../components/common/FormInput';

interface FuelControlListProps {
  onViewFuelControl: (fuelControl: FuelControl) => void;
  onEditFuelControl: (fuelControl: FuelControl) => void;
  onCreateFuelControl: () => void;
  onCreateFuelInput: () => void;
}

export const FuelControlList: React.FC<FuelControlListProps> = ({
  onViewFuelControl,
  onEditFuelControl,
  onCreateFuelControl,
  onCreateFuelInput,
}) => {
  const {
    getFuelControls,
    getFuelControlStatistics,
    getTodayFuelControl,
    getFuelInputs,
  } = useFuelControlService();

  const [fuelControls, setFuelControls] = useState<FuelControl[]>([]);
  const [fuelInputs, setFuelInputs] = useState<FuelInput[]>([]);
  const [filters, setFilters] = useState<FuelControlFilters>({});
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [statusStats, setStatusStats] = useState({
    IN_PROGRESS: 0,
    PENDING_SIGNATURE_1: 0,
    PENDING_SIGNATURE_2: 0,
    PENDING_SIGNATURE_3: 0,
    COMPLETED: 0,
  });
  const [todayFuelControl, setTodayFuelControl] = useState<FuelControl | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('outputs');
  const [loadingControls, setLoadingControls] = useState(false);
  const [loadingInputs, setLoadingInputs] = useState(false);

  const isInitialMount = useRef(true);

  const loadFuelControls = async (page = 1) => {
    setLoadingControls(true);
    try {
      const result = await getFuelControls(page, pageSize, filters);
      if (result) {
        setFuelControls(result.fuelControls);
        setTotal(result.total);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading fuel controls:', error);
    } finally {
      setLoadingControls(false);
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingInputs(true);
      setLoadingControls(true);
      try {
        // Cargar datos en paralelo
        const [stats, todayControl, inputs, controlsResult] = await Promise.all(
          [
            getFuelControlStatistics(),
            getTodayFuelControl(),
            getFuelInputs(1),
            getFuelControls(1, pageSize, {}),
          ]
        );

        if (stats) {
          setStatusStats(stats);
        }
        if (todayControl) {
          setTodayFuelControl(todayControl);
        }
        setFuelInputs(inputs);
        if (controlsResult) {
          setFuelControls(controlsResult.fuelControls);
          setTotal(controlsResult.total);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoadingInputs(false);
        setLoadingControls(false);
      }
    };

    loadInitialData();
  }, []);

  // Load fuel controls when filters change (but not on initial mount)
  useEffect(() => {
    // Skip the first render to avoid duplicate loading
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    loadFuelControls(1);
  }, [filters]);

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchValue }));
      setCurrentPage(1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setSearchValue(value);
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchValue('');
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: FuelControlStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? undefined : status,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    loadFuelControls(page);
  };

  const getStatusColor = (status: FuelControlStatus) => {
    switch (status) {
      case FuelControlStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case FuelControlStatus.PENDING_SIGNATURE_1:
      case FuelControlStatus.PENDING_SIGNATURE_2:
      case FuelControlStatus.PENDING_SIGNATURE_3:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case FuelControlStatus.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: FuelControlStatus) => {
    switch (status) {
      case FuelControlStatus.IN_PROGRESS:
        return 'En ejecución';
      case FuelControlStatus.PENDING_SIGNATURE_1:
        return 'Pendiente firma 1';
      case FuelControlStatus.PENDING_SIGNATURE_2:
        return 'Pendiente firma 2';
      case FuelControlStatus.PENDING_SIGNATURE_3:
        return 'Pendiente firma 3';
      case FuelControlStatus.COMPLETED:
        return 'Completado';
      default:
        return status;
    }
  };

  const columns: TableColumn<FuelControl>[] = [
    {
      header: 'Fecha',
      accessor: 'date',
      render: (fuelControl: FuelControl) => (
        <span className="font-medium">
          {new Date(fuelControl.date + 'T00:00:00').toLocaleDateString(
            'es-ES',
            {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
            }
          )}
        </span>
      ),
    },
    {
      header: 'Encargado',
      accessor: 'responsible',
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (fuelControl: FuelControl) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            fuelControl.status
          )}`}
        >
          {getStatusText(fuelControl.status)}
        </span>
      ),
    },
  ];

  // Columnas específicas para el tab de Ingresos
  const inputColumns: TableColumn<FuelInput>[] = [
    {
      header: 'Fecha',
      render: (fuelInput: FuelInput) => (
        <span className="font-medium">
          {new Date(
            fuelInput.createdAt.split('T')[0] + 'T00:00:00'
          ).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Orden de Compra',
      render: (fuelInput: FuelInput) => (
        <div>
          <button
            onClick={() => {
              // TODO: Implementar navegación a detalles de orden de compra
              console.log('Ver orden de compra:', fuelInput.purchaseOrder);
            }}
            className="bg-transparent text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors w-full"
          >
            <div className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">
              {fuelInput.purchaseOrder}
            </div>
            <div className="text-sm text-gray-500">{fuelInput.supplier}</div>
          </button>
        </div>
      ),
    },
    {
      header: 'Encargado',
      render: (fuelInput: FuelInput) => {
        const fuelControl = fuelControls.find(
          fc => fc.id === fuelInput.fuelControlId
        );
        return fuelControl?.responsible || 'No asignado';
      },
    },
    {
      header: 'Cantidad',
      render: (fuelInput: FuelInput) => (
        <div className="text-center">
          <div className="font-semibold">
            {fuelInput.quantity} {fuelInput.unit}
          </div>
          <div className="text-xs text-gray-500">
            S/ {fuelInput.price.toFixed(2)} por {fuelInput.unit}
          </div>
        </div>
      ),
    },
    {
      header: 'Total',
      render: (fuelInput: FuelInput) => (
        <div className="text-center font-semibold">
          S/ {fuelInput.total.toFixed(2)}
        </div>
      ),
    },
  ];

  const actions: TableAction<FuelControl>[] = [
    {
      icon: <Eye className="w-5 h-5 text-green-600" />,
      label: 'Ver salidas',
      onClick: onViewFuelControl,
    },
    {
      icon: <Edit className="w-5 h-5 text-blue-600" />,
      label: 'Editar',
      onClick: onEditFuelControl,
      isHidden: (fuelControl: FuelControl) =>
        fuelControl.status === 'COMPLETED',
    },
  ];

  // Acciones específicas para ingresos
  const inputActions: TableAction<FuelInput>[] = [
    {
      icon: <Eye className="w-5 h-5 text-green-600" />,
      label: 'Ver detalles',
      onClick: (fuelInput: FuelInput) => {
        // TODO: Implementar vista de detalles de ingreso
        console.log('Ver detalles de ingreso:', fuelInput);
      },
    },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 sm:px-8 p-2">
      <div className="flex justify-between items-center sm:mb-6 mb-2">
        <h1 className="text-2xl font-bold">Control de Combustible</h1>
        <div className="flex space-x-2">
          {activeTab === 'outputs' && (
            <Button onClick={onCreateFuelControl}>
              <Plus className="h-4 w-4 mr-2" />
              {todayFuelControl ? 'Actualizar salidas de hoy' : 'Crear Salidas'}
            </Button>
          )}
          {activeTab === 'inputs' && (
            <Button onClick={onCreateFuelInput}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar nuevo ingreso
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6">
        {/* Summary Statistics */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resumen de Control de Combustible
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* En ejecución */}
            <div
              onClick={() => handleStatusFilter(FuelControlStatus.IN_PROGRESS)}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === FuelControlStatus.IN_PROGRESS
                  ? 'bg-yellow-100 dark:bg-yellow-800 border-2 border-yellow-400 dark:border-yellow-600 shadow-lg'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    En ejecución
                  </p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {statusStats.IN_PROGRESS}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xl">
                    ⏳
                  </span>
                </div>
              </div>
            </div>

            {/* Pendiente firma 1 */}
            <div
              onClick={() =>
                handleStatusFilter(FuelControlStatus.PENDING_SIGNATURE_1)
              }
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === FuelControlStatus.PENDING_SIGNATURE_1
                  ? 'bg-orange-100 dark:bg-orange-800 border-2 border-orange-400 dark:border-orange-600 shadow-lg'
                  : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Pendiente firma 1
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {statusStats.PENDING_SIGNATURE_1}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full">
                  <span className="text-orange-600 dark:text-orange-400 text-xl">
                    📝
                  </span>
                </div>
              </div>
            </div>

            {/* Pendiente firma 2 */}
            <div
              onClick={() =>
                handleStatusFilter(FuelControlStatus.PENDING_SIGNATURE_2)
              }
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === FuelControlStatus.PENDING_SIGNATURE_2
                  ? 'bg-orange-100 dark:bg-orange-800 border-2 border-orange-400 dark:border-orange-600 shadow-lg'
                  : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Pendiente firma 2
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {statusStats.PENDING_SIGNATURE_2}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full">
                  <span className="text-orange-600 dark:text-orange-400 text-xl">
                    📝
                  </span>
                </div>
              </div>
            </div>

            {/* Pendiente firma 3 */}
            <div
              onClick={() =>
                handleStatusFilter(FuelControlStatus.PENDING_SIGNATURE_3)
              }
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === FuelControlStatus.PENDING_SIGNATURE_3
                  ? 'bg-orange-100 dark:bg-orange-800 border-2 border-orange-400 dark:border-orange-600 shadow-lg'
                  : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Pendiente firma 3
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {statusStats.PENDING_SIGNATURE_3}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full">
                  <span className="text-orange-600 dark:text-orange-400 text-xl">
                    📝
                  </span>
                </div>
              </div>
            </div>

            {/* Completado */}
            <div
              onClick={() => handleStatusFilter(FuelControlStatus.COMPLETED)}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === FuelControlStatus.COMPLETED
                  ? 'bg-green-100 dark:bg-green-800 border-2 border-green-400 dark:border-green-600 shadow-lg'
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Completado
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {statusStats.COMPLETED}
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                  <span className="text-green-600 dark:text-green-400 text-xl">
                    ✅
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <FormInput
                type="text"
                name="search"
                placeholder="Buscar por encargado o fecha..."
                value={searchValue}
                onChange={handleFilterChange}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtros
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  type="date"
                  name="date"
                  label="Fecha"
                  value={filters.date || ''}
                  onChange={handleFilterChange}
                />
                <FormInput
                  type="text"
                  name="responsible"
                  label="Encargado"
                  value={filters.responsible || ''}
                  onChange={handleFilterChange}
                />
                <select
                  name="status"
                  value={filters.status || ''}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Todos los estados</option>
                  <option value="IN_PROGRESS">En ejecución</option>
                  <option value="PENDING_SIGNATURE_1">Pendiente firma 1</option>
                  <option value="PENDING_SIGNATURE_2">Pendiente firma 2</option>
                  <option value="PENDING_SIGNATURE_3">Pendiente firma 3</option>
                  <option value="COMPLETED">Completado</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 w-full bg-gray-200 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl p-2 shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-300 dark:border-gray-800 w-full">
            <nav className="-mb-px flex w-full">
              <div
                onClick={() => setActiveTab('outputs')}
                className={`flex-1 text-center cursor-pointer py-3 px-4 transition-all duration-200 rounded-t-lg
                  ${
                    activeTab === 'outputs'
                      ? 'bg-blue-100 dark:bg-blue-900 border-b-4 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-bold shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 border-b-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="truncate block flex items-center justify-center">
                  <Fuel className="w-4 h-4 mr-2" />
                  Salidas
                </span>
              </div>
              <div
                onClick={() => setActiveTab('inputs')}
                className={`flex-1 text-center cursor-pointer py-3 px-4 transition-all duration-200 rounded-t-lg
                  ${
                    activeTab === 'inputs'
                      ? 'bg-blue-100 dark:bg-blue-900 border-b-4 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 font-bold shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 border-b-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="truncate block flex items-center justify-center">
                  <Fuel className="w-4 h-4 mr-2" />
                  Ingresos
                </span>
              </div>
            </nav>
          </div>

          {/* Contenido de los tabs */}
          <div className="bg-white dark:bg-gray-100/10 rounded-lg border border-gray-200 dark:border-gray-700 mt-4 p-6">
            {activeTab === 'outputs' ? (
              <Table<FuelControl>
                columns={columns}
                data={fuelControls}
                keyField="id"
                loading={loadingControls}
                pagination={{
                  page: currentPage,
                  totalPages,
                  onPageChange: handlePageChange,
                }}
                actions={actions}
                pageSize={pageSize}
              />
            ) : (
              <Table<FuelInput>
                columns={inputColumns}
                data={fuelInputs}
                keyField="id"
                loading={loadingInputs}
                pagination={{
                  page: currentPage,
                  totalPages,
                  onPageChange: handlePageChange,
                }}
                actions={inputActions}
                pageSize={pageSize}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
