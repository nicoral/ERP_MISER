import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFuelDailyControls,
  useFuelDailyControlCreate,
} from '../hooks/useFuelControl';
import type { FuelDailyControl, FuelControlFilters } from '../types';
import { FuelDailyControlStatus } from '../types';
import type { FuelInput } from '../types';
import { Button } from '../../../components/common/Button';
import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../../components/common/Table';
import { Card } from '../../../components/ui/card';
import { Plus, Eye, Fuel, Loader2, X } from 'lucide-react';
import { FormInput } from '../../../components/common/FormInput';
import { useAuthWarehouse } from '../../../hooks/useAuthService';
import { useToast } from '../../../contexts/ToastContext';
import { ROUTES } from '../../../config/constants';
import type { Warehouse } from '../../../types/warehouse';

type ButtonBehavior =
  | { type: 'create' }
  | { type: 'view'; control: FuelDailyControl };

interface CreateFuelControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fuelControl: FuelDailyControl) => void;
  availableWarehouses: Warehouse[];
}

const CreateFuelControlModal: React.FC<CreateFuelControlModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  availableWarehouses,
}) => {
  const [formData, setFormData] = useState({
    warehouseId: '',
  });

  const { mutate: createFuelControl, isPending } = useFuelDailyControlCreate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.warehouseId) {
      showError('Por favor selecciona un almacén');
      return;
    }

    createFuelControl(
      {
        warehouseId: parseInt(formData.warehouseId),
      },
      {
        onSuccess: fuelControl => {
          showSuccess('Control diario creado exitosamente');
          onSuccess(fuelControl);
          onClose();
          setFormData({
            warehouseId: '',
          });
        },
        onError: error => {
          showError('Error al crear el control diario');
          console.error('Error creating fuel control:', error);
        },
      }
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Crear Control Diario
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Almacén
            </label>
            <select
              name="warehouseId"
              value={formData.warehouseId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Seleccionar almacén</option>
              {availableWarehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creando...' : 'Crear Control'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const FuelControlList: React.FC = () => {
  const navigate = useNavigate();
  const { warehouses, loading: loadingWarehouses } = useAuthWarehouse();
  const { mutate: createFuelControl } = useFuelDailyControlCreate();
  const { showSuccess, showError } = useToast();

  const [filters, setFilters] = useState<FuelControlFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('outputs');
  const [fuelInputs, setFuelInputs] = useState<FuelInput[]>([]);
  const [loadingInputs, setLoadingInputs] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Usar el hook de React Query para obtener datos reales
  const { data: fuelControlsData, isLoading: loadingControls } =
    useFuelDailyControls(currentPage, pageSize, filters);

  const fuelControls = fuelControlsData?.data || [];
  const total = fuelControlsData?.total || 0;

  // Obtener controles del día actual
  const today = new Date().toISOString().split('T')[0];
  const todayControls = fuelControls.filter(
    control =>
      new Date(control.controlDate).toISOString().split('T')[0] === today
  );

  // Determinar si mostrar el botón y qué almacenes están disponibles
  const shouldShowCreateButton = () => {
    if (loadingWarehouses || warehouses.length === 0) return false;

    // Si el usuario tiene múltiples almacenes, verificar si hay alguno sin control
    if (warehouses.length > 1) {
      const warehousesWithControl = todayControls.map(
        control => control.warehouse.id
      );
      const availableWarehouses = warehouses.filter(
        warehouse => !warehousesWithControl.includes(warehouse.id)
      );
      return availableWarehouses.length > 0;
    }

    // Si el usuario tiene un solo almacén, siempre mostrar el botón
    return warehouses.length === 1;
  };

  // Determinar el comportamiento del botón para un solo almacén
  const getButtonBehavior = (): ButtonBehavior => {
    if (warehouses.length !== 1) return { type: 'create' };

    const hasControl = todayControls.some(
      control => control.warehouse.id === warehouses[0].id
    );

    if (hasControl) {
      // Si ya tiene control, navegar a la vista de detalles
      const existingControl = todayControls.find(
        control => control.warehouse.id === warehouses[0].id
      );
      return { type: 'view', control: existingControl! };
    } else {
      // Si no tiene control, crear uno nuevo
      return { type: 'create' };
    }
  };

  const handleButtonClick = () => {
    const behavior = getButtonBehavior();

    if (behavior.type === 'view' && behavior.control) {
      handleViewFuelControl(behavior.control);
    } else {
      handleCreateFuelControl();
    }
  };

  const handleViewFuelControl = (fuelControl: FuelDailyControl) => {
    navigate(
      ROUTES.FUEL_CONTROL_DETAILS.replace(':id', fuelControl.id.toString())
    );
  };

  const handleCreateFuelControl = () => {
    // Prevenir múltiples clicks
    if (isCreating) return;
    setIsCreating(true);

    // Si el usuario solo tiene un almacén, crear automáticamente
    if (warehouses.length === 1 && !loadingWarehouses) {
      createFuelControl(
        {
          warehouseId: warehouses[0].id,
        },
        {
          onSuccess: fuelControl => {
            showSuccess('Control diario creado exitosamente');
            // Navegar directamente a la vista de detalles
            handleViewFuelControl(fuelControl);
            setIsCreating(false);
          },
          onError: error => {
            showError('Error al crear el control diario');
            console.error('Error creating fuel control:', error);
            setIsCreating(false);
          },
        }
      );
    } else {
      // Si tiene múltiples almacenes, mostrar modal
      setShowCreateModal(true);
      setIsCreating(false);
    }
  };

  const handleCreateFuelInput = () => {
    // Navegar a la creación de entrada de combustible
    console.log('Crear entrada de combustible');
  };

  const handleCreateSuccess = (fuelControl: FuelDailyControl) => {
    // Navegar directamente a la vista de detalles
    handleViewFuelControl(fuelControl);
  };

  const getButtonText = () => {
    const behavior = getButtonBehavior();

    if (behavior.type === 'view') {
      return 'Ver control del día';
    } else {
      return isCreating ? 'Creando...' : 'Registrar día';
    }
  };

  const getButtonIcon = () => {
    const behavior = getButtonBehavior();

    if (behavior.type === 'view') {
      return <Eye className="h-4 w-4 mr-2" />;
    } else {
      return isCreating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Plus className="h-4 w-4 mr-2" />
      );
    }
  };

  const isInitialMount = useRef(true);

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingInputs(true);
      try {
        // TODO: Implementar getFuelInputs cuando esté disponible en el backend
        setFuelInputs([]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoadingInputs(false);
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
    setCurrentPage(1);
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

  const handleStatusFilter = (status: FuelDailyControlStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? undefined : status,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: FuelDailyControlStatus) => {
    switch (status) {
      case FuelDailyControlStatus.OPEN:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case FuelDailyControlStatus.CLOSED:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case FuelDailyControlStatus.SIGNED_1:
      case FuelDailyControlStatus.SIGNED_2:
      case FuelDailyControlStatus.SIGNED_3:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case FuelDailyControlStatus.FINALIZED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case FuelDailyControlStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: FuelDailyControlStatus) => {
    switch (status) {
      case FuelDailyControlStatus.OPEN:
        return 'En ejecución';
      case FuelDailyControlStatus.CLOSED:
        return 'Pendiente firma 1';
      case FuelDailyControlStatus.SIGNED_1:
        return 'Pendiente firma 2';
      case FuelDailyControlStatus.SIGNED_2:
        return 'Pendiente firma 3';
      case FuelDailyControlStatus.FINALIZED:
        return 'Completado';
      case FuelDailyControlStatus.CANCELLED:
        return 'Cancelado';
      default:
        return status;
    }
  };

  const columns: TableColumn<FuelDailyControl>[] = [
    {
      header: 'Fecha',
      accessor: 'controlDate',
      render: (fuelControl: FuelDailyControl) => (
        <span className="font-medium">
          {new Date(fuelControl.controlDate + 'T00:00:00').toLocaleDateString(
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
      header: 'Almacén',
      accessor: 'warehouse',
      render: (fuelControl: FuelDailyControl) => (
        <span className="font-medium">
          {fuelControl.warehouse?.name || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (fuelControl: FuelDailyControl) => (
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
        return fuelControl?.warehouse?.name || 'No asignado';
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

  const actions: TableAction<FuelDailyControl>[] = [
    {
      icon: <Eye className="w-5 h-5 text-green-600" />,
      label: 'Ver salidas',
      onClick: handleViewFuelControl,
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
          {activeTab === 'outputs' && shouldShowCreateButton() && (
            <Button
              onClick={handleButtonClick}
              disabled={loadingWarehouses || isCreating}
            >
              {getButtonIcon()}
              {getButtonText()}
            </Button>
          )}
          {activeTab === 'inputs' && (
            <Button onClick={handleCreateFuelInput}>
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
              onClick={() => handleStatusFilter(FuelDailyControlStatus.OPEN)}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === FuelDailyControlStatus.OPEN
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
                    {
                      fuelControls.filter(
                        fc => fc.status === FuelDailyControlStatus.OPEN
                      ).length
                    }
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
              onClick={() => handleStatusFilter(FuelDailyControlStatus.CLOSED)}
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === FuelDailyControlStatus.CLOSED
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
                    {
                      fuelControls.filter(
                        fc => fc.status === FuelDailyControlStatus.CLOSED
                      ).length
                    }
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
                handleStatusFilter(FuelDailyControlStatus.SIGNED_1)
              }
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === FuelDailyControlStatus.SIGNED_1
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
                    {
                      fuelControls.filter(
                        fc => fc.status === FuelDailyControlStatus.SIGNED_1
                      ).length
                    }
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
                handleStatusFilter(FuelDailyControlStatus.SIGNED_2)
              }
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === FuelDailyControlStatus.SIGNED_2
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
                    {
                      fuelControls.filter(
                        fc => fc.status === FuelDailyControlStatus.SIGNED_2
                      ).length
                    }
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
              onClick={() =>
                handleStatusFilter(FuelDailyControlStatus.FINALIZED)
              }
              className={`rounded-lg p-4 w-full text-left transition-all hover:shadow-md hover:scale-105 cursor-pointer ${
                filters.status === FuelDailyControlStatus.FINALIZED
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
                    {
                      fuelControls.filter(
                        fc => fc.status === FuelDailyControlStatus.FINALIZED
                      ).length
                    }
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
              <Button variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
            </div>
          </div>
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
              <Table<FuelDailyControl>
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

      {showCreateModal && (
        <CreateFuelControlModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          availableWarehouses={warehouses}
        />
      )}
    </div>
  );
};
