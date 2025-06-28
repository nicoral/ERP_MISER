import React, { useState, useEffect } from 'react';
import { type SelectedSupplier } from '../../../../types/quotation';
import { type Supplier } from '../../../../types/supplier';
import { Button } from '../../../../components/common/Button';
import { FormInput } from '../../../../components/common/FormInput';
import { useSupplierService } from '../../../../hooks/useSupplierService';

interface SupplierSelectionProps {
  // requirement: Requirement; // Eliminado porque no se usa
  selectedSuppliers: SelectedSupplier[];
  onComplete: (selectedSuppliers: SelectedSupplier[]) => void;
  onBack: () => void;
}

export const SupplierSelection: React.FC<SupplierSelectionProps> = ({
  // requirement, // Eliminado porque no se usa
  selectedSuppliers,
  onComplete,
  onBack,
}) => {
  const { suppliers, loading, error } = useSupplierService();
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<Set<number>>(
    new Set(selectedSuppliers.map(s => s.supplier.id))
  );

  useEffect(() => {
    if (suppliers) {
      let filtered = suppliers.filter(supplier => supplier.status === 'ACTIVE');

      if (searchTerm) {
        filtered = filtered.filter(
          supplier =>
            supplier.businessName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            supplier.ruc.includes(searchTerm) ||
            supplier.contactPerson
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      if (categoryFilter) {
        filtered = filtered.filter(supplier =>
          supplier.lines.toLowerCase().includes(categoryFilter.toLowerCase())
        );
      }

      if (locationFilter) {
        filtered = filtered.filter(supplier =>
          supplier.address?.toLowerCase().includes(locationFilter.toLowerCase())
        );
      }

      setFilteredSuppliers(filtered);
    }
  }, [suppliers, searchTerm, categoryFilter, locationFilter]);

  const handleSupplierToggle = (supplierId: number) => {
    const newSelected = new Set(selectedSupplierIds);
    if (newSelected.has(supplierId)) {
      newSelected.delete(supplierId);
    } else {
      newSelected.add(supplierId);
    }
    setSelectedSupplierIds(newSelected);
  };

  const handleSupplierClick = (supplierId: number) => {
    handleSupplierToggle(supplierId);
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredSuppliers.map(s => s.id));
    setSelectedSupplierIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedSupplierIds(new Set());
  };

  const handleConfirmSelection = () => {
    const selectedSuppliersData: SelectedSupplier[] =
      suppliers
        ?.filter(supplier => selectedSupplierIds.has(supplier.id))
        .map(supplier => ({
          supplier,
          isSelected: true,
        })) || [];

    // Verificar si hay cambios en la selección
    const currentSupplierIds = new Set(
      selectedSuppliers.map(s => s.supplier.id)
    );
    const newSupplierIds = new Set(
      selectedSuppliersData.map(s => s.supplier.id)
    );

    const hasChanges =
      currentSupplierIds.size !== newSupplierIds.size ||
      Array.from(currentSupplierIds).some(id => !newSupplierIds.has(id)) ||
      Array.from(newSupplierIds).some(id => !currentSupplierIds.has(id));

    if (hasChanges) {
      // Mostrar confirmación si hay cambios
      const confirmed = window.confirm(
        'Has realizado cambios en la selección de proveedores. ¿Estás seguro de que quieres continuar? Los datos de órdenes existentes se mantendrán.'
      );

      if (!confirmed) {
        return;
      }
    }

    onComplete(selectedSuppliersData);
  };

  const getCategories = () => {
    const categories = new Set<string>();
    suppliers?.forEach(supplier => {
      if (supplier.lines) {
        supplier.lines.split(',').forEach(line => {
          categories.add(line.trim());
        });
      }
    });
    return Array.from(categories).sort();
  };

  const getLocations = () => {
    const locations = new Set<string>();
    suppliers?.forEach(supplier => {
      if (supplier.address) {
        const location = supplier.address.split(',')[0]?.trim();
        if (location) locations.add(location);
      }
    });
    return Array.from(locations).sort();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">
            Error al cargar proveedores: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Seleccionar Proveedores
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selecciona al menos 3 proveedores para continuar con el proceso de
          cotización
        </p>
        {selectedSuppliers.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Nota:</strong> Puedes modificar la selección de
              proveedores. Los cambios se aplicarán manteniendo los datos de
              órdenes existentes.
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <FormInput
          label="Buscar proveedor"
          placeholder="Nombre, RUC o contacto..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoría
          </label>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3 h-10"
          >
            <option value="">Todas las categorías</option>
            {getCategories().map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ubicación
          </label>
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3 h-10"
          >
            <option value="">Todas las ubicaciones</option>
            {getLocations().map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end space-x-2">
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="text-sm"
          >
            Seleccionar Todos
          </Button>
          <Button
            variant="outline"
            onClick={handleDeselectAll}
            className="text-sm"
          >
            Deseleccionar
          </Button>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Proveedores ({filteredSuppliers.length})
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Seleccionados: {selectedSupplierIds.size}
              </span>
              {selectedSupplierIds.size > 0 && selectedSupplierIds.size < 3 && (
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Mínimo 3 proveedores requeridos
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredSuppliers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron proveedores con los filtros aplicados
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSuppliers.map(supplier => (
                <div
                  key={supplier.id}
                  className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => handleSupplierClick(supplier.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {supplier.businessName}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            RUC: {supplier.ruc}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                supplier.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {supplier.status === 'ACTIVE'
                                ? 'Activo'
                                : 'Inactivo'}
                            </span>
                            <div className="flex items-center text-yellow-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < supplier.rating ? 'fill-current' : 'fill-gray-300 dark:fill-gray-600'}`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Contacto:</span>{' '}
                          {supplier.contactPerson}
                        </div>
                        <div>
                          <span className="font-medium">Teléfono:</span>{' '}
                          {supplier.mobile}
                        </div>
                        <div>
                          <span className="font-medium">Categorías:</span>{' '}
                          {supplier.lines}
                        </div>
                      </div>

                      {supplier.address && (
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Dirección:</span>{' '}
                          {supplier.address}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                          selectedSupplierIds.has(supplier.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                        onClick={() => handleSupplierClick(supplier.id)}
                      >
                        {selectedSupplierIds.has(supplier.id) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              ← Volver
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setSelectedSupplierIds(new Set())}
            disabled={selectedSupplierIds.size === 0}
          >
            Limpiar Selección
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={selectedSupplierIds.size < 3}
          >
            Confirmar Selección ({selectedSupplierIds.size} proveedores)
          </Button>
        </div>
      </div>
    </div>
  );
};
