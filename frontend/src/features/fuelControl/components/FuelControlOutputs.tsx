import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEmployeesSimple } from '../../../hooks/useEmployeeService';
import {
  useFuelDailyControl,
  useFuelOutputs,
  useFuelOutputCreate,
  useFuelOutputSign,
  useFuelDailyControlClose,
  useFuelDailyControlSign,
  useFuelOutputImageUpdate,
} from '../hooks/useFuelControl';
import type { FuelOutput, CreateFuelOutputDto } from '../types';
import { Button } from '../../../components/common/Button';
import {
  Table,
  type TableColumn,
  type TableAction,
} from '../../../components/common/Table';
import { Card } from '../../../components/ui/card';
import { Modal } from '../../../components/common/Modal';
import { FormInput } from '../../../components/common/FormInput';
import { SearchableSelect } from '../../../components/common/SearchableSelect';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import {
  Plus,
  Fuel,
  ChevronLeft,
  Check,
  FileSignature,
  FileImage,
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { ROUTES } from '../../../config/constants';
import type { CostCenter } from '../../../types/costCenter';
import { useAuth } from '../../../contexts/AuthContext';
import { useCostCentersSimple } from '../../../hooks/useCostCenterService';
import {
  canSignFuelControl,
  getFuelControlSignButtonText,
  hasPermission,
} from '../../../utils/permissions';
import { FuelDailyControlStatus } from '../types';

export const FuelControlOutputs: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const { data: fuelControl, isLoading: loadingFuelControl } =
    useFuelDailyControl(Number(id));
  const { data: fuelOutputs, isLoading: loadingOutputs } = useFuelOutputs(
    Number(id)
  );
  const { mutate: signFuelOutput, isPending: signingOutput } =
    useFuelOutputSign();
  const { mutate: updateImage } = useFuelOutputImageUpdate();
  const { mutate: createFuelOutput, isPending: creatingOutput } =
    useFuelOutputCreate();
  const { showSuccess, showError } = useToast();
  const { data: employees, isLoading: loadingEmployees } = useEmployeesSimple();
  const { data: costCenters, isLoading: loadingCostCenters } =
    useCostCentersSimple();
  const { mutate: closeFuelDailyControl, isPending: closingFuelDailyControl } =
    useFuelDailyControlClose();
  const { mutate: signFuelDailyControl, isPending: signingFuelDailyControl } =
    useFuelDailyControlSign();
  const [showFinalizeWarning, setShowFinalizeWarning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateFuelOutputDto>({
    fuelDailyControlId: Number(id),
    quantity: 0,
    hourMeter: 0,
    costCenterId: 0,
    operatorEmployeeId: 0,
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.operatorEmployeeId || formData.operatorEmployeeId === 0) {
      errors.operatorEmployeeId = 'Debe seleccionar un operador';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = 'La cantidad debe ser mayor a 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor corrija los errores en el formulario');
      return;
    }

    if (!selectedFile) {
      showError('Por favor suba una imagen');
      return;
    }

    try {
      createFuelOutput(formData, {
        onSuccess: newOutput => {
          updateImage({ id: newOutput.id, file: selectedFile });
          showSuccess('Salida de combustible registrada exitosamente');
          setShowAddModal(false);
          resetForm();
        },
        onError: error => {
          console.error('Error creating fuel output:', error);
          showError('Error al registrar la salida de combustible');
        },
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      showError('Error inesperado al registrar la salida');
    }
  };

  const handleSignFuelOutput = async (id: number) => {
    try {
      signFuelOutput(id, {
        onSuccess: () => {
          showSuccess('Salida de combustible firmada exitosamente');
        },
        onError: error => {
          console.error('Error signing fuel output:', error);
          showError('Error al firmar la salida de combustible');
        },
      });
    } catch (error) {
      console.error('Error signing fuel output:', error);
    }
  };

  const handleFinalizeDay = async () => {
    try {
      closeFuelDailyControl(
        {
          id: Number(id),
          data: {},
        },
        {
          onSuccess: () => {
            showSuccess('Día finalizado exitosamente');
            setShowFinalizeWarning(false);
          },
          onError: error => {
            console.error('Error finalizing fuel control:', error);
            showError('Error al finalizar el día');
          },
        }
      );
    } catch (error) {
      console.error('Error finalizing fuel control:', error);
    }
  };

  const handleSignFuelDailyControl = async () => {
    try {
      signFuelDailyControl(Number(id), {
        onSuccess: () => {
          showSuccess('Control de combustible firmado exitosamente');
        },
        onError: error => {
          console.error('Error signing fuel daily control:', error);
          showError('Error al firmar el control de combustible');
        },
      });
    } catch (error) {
      console.error('Error signing fuel daily control:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      fuelDailyControlId: Number(id),
      quantity: 0,
      hourMeter: 0,
      costCenterId: 0,
      operatorEmployeeId: 0,
    });
    setFormErrors({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBack = () => {
    navigate(ROUTES.FUEL_CONTROL);
  };

  const calculateTotal = () => {
    return fuelOutputs?.reduce((acc, output) => acc + +output.quantity, 0) || 0;
  };

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

  const handleViewImage = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  // Preparar opciones para los selectores
  const employeeOptions =
    employees?.map(employee => ({
      value: employee.id,
      label: `${employee.firstName} ${employee.lastName}`,
    })) || [];

  const costCenterOptions =
    costCenters?.map((costCenter: CostCenter) => ({
      value: costCenter.id,
      label: costCenter.description,
    })) || [];

  // Columnas para la tabla de salidas
  const columns: TableColumn<FuelOutput>[] = [
    {
      header: 'Hora',
      render: (output: FuelOutput) => (
        <div className="font-medium">{output.outputTime}</div>
      ),
    },
    {
      header: 'Operador',
      render: (output: FuelOutput) => (
        <div className="font-medium">
          {output.operatorEmployee?.firstName}{' '}
          {output.operatorEmployee?.lastName}
        </div>
      ),
    },

    {
      header: 'Vehículo/Equipo',
      render: (output: FuelOutput) => (
        <div className="font-medium">
          {output.costCenter?.description || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Codigo',
      render: (output: FuelOutput) => (
        <div className="font-medium">{output.costCenter?.code || 'N/A'}</div>
      ),
    },
    {
      header: 'Cantidad',
      render: (output: FuelOutput) => (
        <div className="text-center font-semibold">
          {output.quantity} galones
        </div>
      ),
    },
    {
      header: 'Horometro',
      render: (output: FuelOutput) => (
        <div className="font-medium">{output.hourMeter || 'N/A'}</div>
      ),
    },
    {
      header: 'Estado',
      render: (output: FuelOutput) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            output.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : output.status === 'SIGNED'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {output.status === 'PENDING'
            ? 'Pendiente'
            : output.status === 'SIGNED'
              ? 'Firmado'
              : 'Cancelado'}
        </span>
      ),
    },
  ];

  const actions: TableAction<FuelOutput>[] = [
    {
      icon: <FileImage className="w-5 h-5 text-blue-600" />,
      label: 'Foto',
      isHidden: output => !output.imageUrl,
      onClick: (output: FuelOutput) => {
        handleViewImage(output.imageUrl);
      },
    },
    {
      icon: signingOutput ? (
        <LoadingSpinner size="sm" className="text-green-600" />
      ) : (
        <Check className="w-5 h-5 text-green-600" />
      ),
      label: 'Firmar',
      isHidden: output =>
        output.operatorEmployee?.id !== user?.id || output.status !== 'PENDING',
      onClick: (output: FuelOutput) => {
        handleSignFuelOutput(output.id);
      },
      disabled: signingOutput,
    },
  ];

  // Ordenar salidas del más antiguo al más reciente
  const sortedOutputs = [...(fuelOutputs || [])].sort(
    (a, b) =>
      new Date(a.outputTime).getTime() - new Date(b.outputTime).getTime()
  );

  if (loadingFuelControl) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (!fuelControl) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Control de combustible no encontrado</p>
      </div>
    );
  }

  const getStatusColor = (status: FuelDailyControlStatus) => {
    switch (status) {
      case FuelDailyControlStatus.OPEN:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full p-2';
      case FuelDailyControlStatus.CLOSED:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full p-2';
      case FuelDailyControlStatus.SIGNED_1:
      case FuelDailyControlStatus.SIGNED_2:
      case FuelDailyControlStatus.SIGNED_3:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full p-2';
      case FuelDailyControlStatus.FINALIZED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full p-2';
      case FuelDailyControlStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full p-2';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 rounded-full p-2';
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

  return (
    <>
      <div className="space-y-6 sm:px-8 p-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
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
                  Salidas de Combustible -{' '}
                  <span className={getStatusColor(fuelControl.status)}>
                    {getStatusText(fuelControl.status)}
                  </span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(
                    fuelControl.controlDate + 'T00:00:00'
                  ).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                  })}{' '}
                  - {fuelControl.warehouse?.name}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {today ===
              new Date(
                fuelControl.controlDate + 'T00:00:00'
              ).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              }) &&
              hasPermission('create_fuel_control') && (
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Salida
                </Button>
              )}
            {fuelControl.status === 'OPEN' &&
              hasPermission('create_fuel_control') && (
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => setShowFinalizeWarning(true)}
                >
                  Finalizar día
                </Button>
              )}
            {fuelControl.status !== 'OPEN' &&
              canSignFuelControl(fuelControl) && (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSignFuelDailyControl}
                  disabled={signingFuelDailyControl}
                >
                  {signingFuelDailyControl ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Firmando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileSignature className="h-4 w-4" />
                      {getFuelControlSignButtonText(fuelControl)}
                    </span>
                  )}
                </Button>
              )}
          </div>
        </div>

        {/* Contenido */}
        <Card className="p-6">
          {loadingOutputs ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="lg" className="text-blue-600" />
            </div>
          ) : (
            <>
              <Table<FuelOutput>
                columns={columns}
                data={sortedOutputs}
                keyField="id"
                loading={loadingOutputs}
                actions={actions}
                pageSize={10}
              />
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Salidas de combustible
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {calculateTotal()} galones
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Card signatures */}
        {fuelControl.status !== 'OPEN' && (
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Firmas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Cisternero', date: fuelControl?.firstSignedAt },
                  {
                    label: 'Administración',
                    date: fuelControl?.secondSignedAt,
                  },
                  { label: 'Logística', date: fuelControl?.thirdSignedAt },
                ].map((firma, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded shadow"
                  >
                    <div className="font-medium text-sm mb-1">
                      {firma.label}
                    </div>
                    {firma.date ? (
                      <div className="text-xs text-green-600 dark:text-green-300 font-semibold">
                        {new Date(firma.date).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        Pendiente
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modal para agregar salida */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Agregar Salida de Combustible"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
            <div>
              <SearchableSelect
                id="operatorEmployeeId"
                name="operatorEmployeeId"
                label="Operador *"
                value={formData.operatorEmployeeId || ''}
                onChange={handleChange}
                options={employeeOptions}
                placeholder="Seleccionar operador"
                required
                disabled={loadingEmployees}
              />
              {formErrors.operatorEmployeeId && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.operatorEmployeeId}
                </p>
              )}
              {loadingEmployees && (
                <p className="text-gray-500 text-sm mt-1">
                  Cargando empleados...
                </p>
              )}
            </div>
            <div>
              <SearchableSelect
                id="costCenterId"
                name="costCenterId"
                label="Centro de Costo *"
                value={formData.costCenterId || ''}
                onChange={handleChange}
                options={costCenterOptions}
                placeholder="Seleccionar centro de costo"
                required
                disabled={loadingCostCenters}
              />
              {formErrors.costCenterId && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.costCenterId}
                </p>
              )}
              {loadingCostCenters && (
                <p className="text-gray-500 text-sm mt-1">
                  Cargando centros de costo...
                </p>
              )}
            </div>
            <div>
              <FormInput
                id="quantity"
                name="quantity"
                label="Cantidad (galones) *"
                type="decimal"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
              />
              {formErrors.quantity && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.quantity}
                </p>
              )}
            </div>
            <div>
              <FormInput
                id="hourMeter"
                name="hourMeter"
                label="Horometro"
                type="decimal"
                value={formData.hourMeter}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <FormInput
                id="file"
                name="file"
                label="Foto"
                type="file"
                onChange={handleFileChange}
              />
            </div>
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
            <Button type="submit" disabled={creatingOutput || loadingEmployees}>
              {creatingOutput ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Finalize Fuel Control Warning Modal */}
      {showFinalizeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-orange-500 text-2xl">⚠️</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirmar Aprobación
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <strong>¡Atención!</strong> Una vez finalizado el día, no se
              permitirán más ediciones. Esta acción es irreversible.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas finalizar el día?
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowFinalizeWarning(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleFinalizeDay}
                disabled={closingFuelDailyControl}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {closingFuelDailyControl
                  ? '🔄 Finalizando...'
                  : 'Sí, Finalizar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Visualizar Imagen
              </h2>
              <button
                onClick={() => setShowImageModal(false)}
                className="bg-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex justify-center">
              {selectedImageUrl && (
                <img
                  src={selectedImageUrl}
                  alt="Imagen de salida de combustible"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  onError={e => {
                    console.error('Error loading image:', e);
                    showError('Error al cargar la imagen');
                  }}
                />
              )}
            </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={() => setShowImageModal(false)}
                variant="outline"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
