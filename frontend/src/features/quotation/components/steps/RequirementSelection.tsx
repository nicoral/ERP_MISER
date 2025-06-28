import React, { useState, useEffect } from 'react';
import { useRequirementService } from '../../../../hooks/useRequirementService';
import { Button } from '../../../../components/common/Button';
import { FormInput } from '../../../../components/common/FormInput';
import type { Requirement } from '../../../../types/requirement';

interface RequirementSelectionProps {
  onRequirementSelected: (requirement: Requirement) => void;
  onBack?: () => void;
  isCreatingQuotation?: boolean;
}

export const RequirementSelection: React.FC<RequirementSelectionProps> = ({
  onRequirementSelected,
  onBack,
  isCreatingQuotation,
}) => {
  const { requirements, loading, error, fetchRequirements, fetchRequirement } =
    useRequirementService();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequirement, setSelectedRequirement] =
    useState<Requirement | null>(null);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const filteredRequirements = requirements.filter(requirement => {
    const matchesSearch =
      requirement.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.observation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || requirement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRequirementSelect = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
  };

  const handleConfirmSelection = async () => {
    if (selectedRequirement) {
      // Obtener el detalle completo del requerimiento
      const fullRequirement = await fetchRequirement(selectedRequirement.id);
      if (fullRequirement) {
        onRequirementSelected(fullRequirement);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APROBADO':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'ALTA':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'BAJA':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
            Error al cargar requerimientos: {error}
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
          Seleccionar Requerimiento Base
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Selecciona el requerimiento aprobado para iniciar el proceso de
          cotización
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <FormInput
          label="Buscar requerimiento"
          placeholder="Código o descripción..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3 h-10"
          >
            <option value="">Todos los estados</option>
            <option value="APROBADO">Aprobado</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
            className="text-sm"
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      {/* Requirements List */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Requerimientos ({filteredRequirements.length})
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Seleccionado:{' '}
              {selectedRequirement ? selectedRequirement.code : 'Ninguno'}
            </span>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredRequirements.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron requerimientos con los filtros aplicados
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRequirements.map(requirement => (
                <div
                  key={requirement.id}
                  className={`p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                    selectedRequirement?.id === requirement.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                      : ''
                  }`}
                  onClick={() => handleRequirementSelect(requirement)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {requirement.code}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            requirement.status
                          )}`}
                        >
                          {requirement.status}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            requirement.priority
                          )}`}
                        >
                          {requirement.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {requirement.observation}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <div>
                          <span className="font-medium">Centro de costo:</span>{' '}
                          {requirement.costCenter.description}
                        </div>
                        <div>
                          <span className="font-medium">Solicitante:</span>{' '}
                          {requirement.employee.firstName}{' '}
                          {requirement.employee.lastName}
                        </div>
                        <div>
                          <span className="font-medium">Artículos:</span>{' '}
                          {requirement.requirementArticles?.length || 0}{' '}
                          productos
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <input
                        type="radio"
                        name="selectedRequirement"
                        checked={selectedRequirement?.id === requirement.id}
                        onChange={() => handleRequirementSelect(requirement)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            ← Volver
          </Button>
        )}
        <div className="ml-auto">
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedRequirement || isCreatingQuotation}
          >
            {isCreatingQuotation
              ? 'Creando cotización...'
              : `Continuar con ${selectedRequirement?.code || 'Requerimiento'}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
