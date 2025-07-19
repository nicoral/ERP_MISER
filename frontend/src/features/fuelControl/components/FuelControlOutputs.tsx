import React, { useState, useEffect } from 'react';
import { useFuelControlService } from '../hooks/useFuelControl';
import { useEmployeesSimple } from '../../../hooks/useEmployeeService';
import { useCostCenters } from '../../costCenter/hooks/useCostCenter';
import type { FuelControl, FuelSupply, CreateFuelSupply } from '../types';
import { Button } from '../../../components/common/Button';
import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../../components/common/Table';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/common/Modal';
import { FormInput } from '../../../components/common/FormInput';
import { FormSelect } from '../../../components/common/FormSelect';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { ImagePreview } from '../../../components/common/ImagePreview';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Plus, Eye, Edit, Fuel, ChevronLeft } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

interface FuelControlOutputsProps {
  fuelControl: FuelControl;
  onBack: () => void;
}

export const FuelControlOutputs: React.FC<FuelControlOutputsProps> = ({
  fuelControl,
  onBack,
}) => {
  const { getFuelSupplies, createFuelSupply, loading } =
    useFuelControlService();
  const { showSuccess, showError } = useToast();
  const { data: employees } = useEmployeesSimple();
  const { data: costCenters } = useCostCenters(1, 1000);

  const [fuelSupplies, setFuelSupplies] = useState<FuelSupply[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<CreateFuelSupply>({
    fuelControlId: fuelControl.id,
    operatorId: 0,
    hourmeter: 0,
    gallons: 0,
    costCenterId: 0,
  });

  // Cargar abastecimientos al montar el componente
  useEffect(() => {
    loadFuelSupplies();
  }, [fuelControl.id]);

  const loadFuelSupplies = async () => {
    try {
      const supplies = await getFuelSupplies(fuelControl.id);
      setFuelSupplies(supplies);
    } catch (error) {
      console.error('Error loading fuel supplies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.operatorId ||
      !formData.costCenterId ||
      formData.gallons <= 0
    ) {
      showError('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const newSupply = await createFuelSupply({
        ...formData,
        photoUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      });

      if (newSupply) {
        showSuccess(
          'Abastecimiento agregado',
          'El abastecimiento se agregó correctamente'
        );
        setFuelSupplies(prev => [...prev, newSupply]);
        setShowAddModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating fuel supply:', error);
      showError('Error', 'No se pudo agregar el abastecimiento');
    }
  };

  const resetForm = () => {
    setFormData({
      fuelControlId: fuelControl.id,
      operatorId: 0,
      hourmeter: 0,
      gallons: 0,
      costCenterId: 0,
    });
    setSelectedFile(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  // Preparar opciones para los selectores
  const employeeOptions =
    employees?.map(employee => ({
      value: employee.id,
      label: `${employee.firstName} ${employee.lastName}`,
    })) || [];

  const costCenterOptions =
    costCenters?.data?.map(costCenter => ({
      value: costCenter.id,
      label: costCenter.description,
    })) || [];

  // Columnas para la tabla de abastecimientos
  const columns: TableColumn<FuelSupply>[] = [
    {
      header: 'Operador',
      render: (supply: FuelSupply) => (
        <div className="font-medium">{supply.operatorName}</div>
      ),
    },
    {
      header: 'Horómetro',
      render: (supply: FuelSupply) => (
        <div className="text-center font-semibold">
          {supply.hourmeter.toLocaleString()}
        </div>
      ),
    },
    {
      header: 'Galones',
      render: (supply: FuelSupply) => (
        <div className="text-center font-semibold">{supply.gallons}</div>
      ),
    },
    {
      header: 'Centro de Costos',
      render: (supply: FuelSupply) => (
        <div className="font-medium">{supply.costCenterName}</div>
      ),
    },
    {
      header: 'Foto',
      render: (supply: FuelSupply) => (
        <div className="text-center">
          {supply.photoUrl ? (
            <img
              src={supply.photoUrl}
              alt="Foto del abastecimiento"
              className="w-8 h-8 rounded object-cover mx-auto"
            />
          ) : (
            <span className="text-gray-400 text-sm">Sin foto</span>
          )}
        </div>
      ),
    },
  ];

  const actions: TableAction<FuelSupply>[] = [
    {
      icon: <Eye className="w-5 h-5 text-green-600" />,
      label: 'Ver detalles',
      onClick: (supply: FuelSupply) => {
        // TODO: Implementar vista de detalles
        console.log('Ver detalles de abastecimiento:', supply);
      },
    },
    {
      icon: <Edit className="w-5 h-5 text-blue-600" />,
      label: 'Editar',
      onClick: (supply: FuelSupply) => {
        // TODO: Implementar edición
        console.log('Editar abastecimiento:', supply);
      },
    },
  ];

  // Ordenar abastecimientos del más antiguo al más reciente
  const sortedSupplies = [...fuelSupplies].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-6 sm:px-8 p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Fuel className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Salidas de Combustible
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(fuelControl.date + 'T00:00:00').toLocaleDateString(
                  'es-ES',
                  {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                  }
                )}{' '}
                - {fuelControl.responsible}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Abastecimiento
        </Button>
      </div>

      {/* Contenido */}
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" className="text-blue-600" />
          </div>
        ) : (
          <Table<FuelSupply>
            columns={columns}
            data={sortedSupplies}
            keyField="id"
            loading={loading}
            actions={actions}
            pageSize={10}
          />
        )}
      </Card>

      {/* Modal para agregar abastecimiento */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Agregar Abastecimiento"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              id="operatorId"
              name="operatorId"
              label="Operador *"
              value={formData.operatorId}
              onChange={handleChange}
              options={employeeOptions}
              placeholder="Seleccionar operador"
              required
            />

            <FormInput
              id="hourmeter"
              name="hourmeter"
              label="Horómetro *"
              type="number"
              value={formData.hourmeter}
              onChange={handleChange}
              required
              min="0"
            />

            <FormInput
              id="gallons"
              name="gallons"
              label="Galones *"
              type="number"
              value={formData.gallons}
              onChange={handleChange}
              required
              min="0"
              step="0.1"
            />

            <FormSelect
              id="costCenterId"
              name="costCenterId"
              label="Centro de Costos *"
              value={formData.costCenterId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar centro de costos</option>
              {costCenterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="flex justify-center">
            <ImagePreview
              imageUrl=""
              onChange={handleFileChange}
              className="w-32 h-32"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
