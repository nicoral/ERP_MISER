import React, { useState, useRef } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { useToast } from '../../../contexts/ToastContext';
import {
  downloadEmployeeTemplate,
  importEmployeesFromExcel,
  type ImportResult,
} from '../../../services/api/employeeService';
import {
  DownloadIcon,
  UploadIcon,
  XIcon,
} from '../../../components/common/Icons';
import { EMPLOYEES_AREAS } from '../../../config/constants';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      setIsLoading(true);
      const blob = await downloadEmployeeTemplate();

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template_empleados.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(
        'Template descargado',
        'El template de empleados se ha descargado correctamente'
      );
    } catch (error) {
      console.error(error);
      showError('Error', 'No se pudo descargar el template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv',
      ];

      if (!validTypes.includes(file.type)) {
        showError(
          'Error',
          'Por favor selecciona un archivo Excel válido (.xlsx, .xls, .csv)'
        );
        return;
      }

      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showError('Error', 'Por favor selecciona un archivo');
      return;
    }

    try {
      setIsLoading(true);
      const result = await importEmployeesFromExcel(selectedFile);
      setImportResult(result);

      if (result.success > 0) {
        showSuccess(
          'Importación exitosa',
          `${result.success} empleados importados correctamente`
        );
        onSuccess?.();
      }

      if (result.errors.length > 0) {
        showError(
          'Errores en importación',
          `${result.errors.length} filas tuvieron errores. Revisa los detalles.`
        );
      }
    } catch (error) {
      console.error(error);
      showError('Error', 'No se pudo importar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="📊 Importar Empleados desde Excel"
    >
      <div className="space-y-6">
        {/* Descargar Template */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
            Paso 1: Descargar Template
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
            Descarga el template con la estructura correcta para importar
            empleados.
          </p>
          <Button
            onClick={handleDownloadTemplate}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <DownloadIcon className="w-4 h-4 mr-2" />
            )}
            Descargar Template
          </Button>
        </div>

        {/* Subir Archivo */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Paso 2: Subir Archivo
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            Selecciona el archivo Excel con los datos de empleados.
          </p>

          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Arrastra y suelta tu archivo aquí, o
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Seleccionar Archivo
              </Button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UploadIcon className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botón Importar */}
        {selectedFile && (
          <div className="flex justify-center">
            <Button
              onClick={handleImport}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <UploadIcon className="w-4 h-4 mr-2" />
              )}
              Importar Empleados
            </Button>
          </div>
        )}

        {/* Resultados */}
        {importResult && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Resultados de la Importación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {importResult.success}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  Importados exitosamente
                </div>
              </div>

              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {importResult.errors.length}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">
                  Con errores
                </div>
              </div>

              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {importResult.total}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Total procesados
                </div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Errores encontrados:
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {importResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded"
                    >
                      <strong>Fila {error.row}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            📋 Información Importante
          </h3>
          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>
              • Los campos email, documentId, firstName, lastName, position,
              phone y address son obligatorios
            </li>
            <li>• Los emails y documentoId deben ser únicos</li>
            <li>• Las fechas deben estar en formato YYYY-MM-DD</li>
            <li>
              • La contraseña se genera automáticamente usando el número de
              documento
            </li>
            <li>
              • El campo area debe ser uno de los siguientes:
              {EMPLOYEES_AREAS.map((area, index) => (
                <span key={index}> {area} </span>
              ))}
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
