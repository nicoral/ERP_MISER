import { useState } from 'react';
import { FuelControlList } from '../features/fuelControl/components/FuelControlList';
import { FuelControlOutputs } from '../features/fuelControl/components/FuelControlOutputs';
import type { FuelControl } from '../features/fuelControl/types';

export default function FuelControl() {
  const [selectedFuelControl, setSelectedFuelControl] =
    useState<FuelControl | null>(null);

  const handleViewFuelControl = (fuelControl: FuelControl) => {
    setSelectedFuelControl(fuelControl);
  };

  const handleEditFuelControl = (fuelControl: FuelControl) => {
    // TODO: Implementar edición de control de combustible
    console.log('Editar control de combustible:', fuelControl);
  };

  const handleCreateFuelControl = () => {
    // TODO: Implementar creación de control de combustible
    console.log('Crear control de combustible');
  };

  const handleCreateFuelInput = () => {
    // TODO: Implementar creación de ingreso de combustible
    console.log('Crear ingreso de combustible');
  };

  const handleBackToList = () => {
    setSelectedFuelControl(null);
  };

  if (selectedFuelControl) {
    return (
      <FuelControlOutputs
        fuelControl={selectedFuelControl}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <FuelControlList
      onViewFuelControl={handleViewFuelControl}
      onEditFuelControl={handleEditFuelControl}
      onCreateFuelControl={handleCreateFuelControl}
      onCreateFuelInput={handleCreateFuelInput}
    />
  );
}
