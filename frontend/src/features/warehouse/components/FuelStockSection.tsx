import React, { useState } from 'react';
import type {
  WarehouseFuelStock,
  WarehouseFuelStockUpdate,
} from '../../../types/warehouse';
import { useWarehouseFuelStockUpdate } from '../hooks/useWarehouse';
import { useToast } from '../../../contexts/ToastContext';
import { FormInput } from '../../../components/common/FormInput';
import { Button } from '../../../components/common/Button';

interface Props {
  fuelStock: WarehouseFuelStock;
  warehouseId: number;
}

export const FuelStockSection: React.FC<Props> = ({
  fuelStock,
  warehouseId,
}) => {
  const { showSuccess, showError } = useToast();
  const updateFuelStockMutation = useWarehouseFuelStockUpdate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<WarehouseFuelStockUpdate>({
    currentStock: fuelStock.currentStock,
    minStock: fuelStock.minStock,
    maxStock: fuelStock.maxStock,
    tankCapacity: fuelStock.tankCapacity,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSave = async () => {
    try {
      await updateFuelStockMutation.mutateAsync({
        warehouseId,
        data: formData,
      });
      showSuccess(
        'Actualizado',
        'Stock de combustible actualizado correctamente'
      );
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      showError('Error', 'No se pudo actualizar el stock de combustible');
    }
  };

  const handleCancel = () => {
    setFormData({
      currentStock: fuelStock.currentStock,
      minStock: fuelStock.minStock,
      maxStock: fuelStock.maxStock,
      tankCapacity: fuelStock.tankCapacity,
    });
    setIsEditing(false);
  };

  const getStockStatus = () => {
    if (+fuelStock.currentStock <= +fuelStock.minStock) {
      return {
        status: 'danger',
        text: 'Stock Bajo',
        color: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200',
      };
    } else if (fuelStock.currentStock >= fuelStock.maxStock * 0.8) {
      return {
        status: 'warning',
        text: 'Stock Alto',
        color:
          'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200',
      };
    } else {
      return {
        status: 'normal',
        text: 'Stock Normal',
        color:
          'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200',
      };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ⛽ Stock de Combustible
        </h3>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Editar
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="currentStock"
              name="currentStock"
              label="Stock Actual (galones)"
              type="number"
              value={formData.currentStock}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
            <FormInput
              id="minStock"
              name="minStock"
              label="Stock Mínimo (galones)"
              type="number"
              value={formData.minStock}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
            <FormInput
              id="maxStock"
              name="maxStock"
              label="Stock Máximo (galones)"
              type="number"
              value={formData.maxStock}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
            <FormInput
              id="tankCapacity"
              name="tankCapacity"
              label="Capacidad del Tanque (galones)"
              type="number"
              value={formData.tankCapacity}
              onChange={handleInputChange}
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={updateFuelStockMutation.isPending}
            >
              {updateFuelStockMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button onClick={handleCancel} variant="outline">
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ⛽ Stock Actual:{' '}
              <span className="text-gray-900 dark:text-white font-medium">
                {fuelStock.currentStock.toLocaleString()} galones
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📊 Estado:{' '}
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}
              >
                {stockStatus.text}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📉 Stock Mínimo:{' '}
              <span className="text-gray-900 dark:text-white font-medium">
                {fuelStock.minStock.toLocaleString()} galones
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📈 Stock Máximo:{' '}
              <span className="text-gray-900 dark:text-white font-medium">
                {fuelStock.maxStock.toLocaleString()} galones
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🏭 Capacidad del Tanque:{' '}
              <span className="text-gray-900 dark:text-white font-medium">
                {fuelStock.tankCapacity.toLocaleString()} galones
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📊 Porcentaje de Uso:{' '}
              <span className="text-gray-900 dark:text-white font-medium">
                {fuelStock.tankCapacity > 0
                  ? `${((fuelStock.currentStock / fuelStock.tankCapacity) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
