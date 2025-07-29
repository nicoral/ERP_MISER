import React, { useState, useRef } from 'react';
import { FileText, X, Download } from 'lucide-react';

interface DocumentUploadProps {
  currentUrl?: string;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // en MB
  label?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  currentUrl,
  onChange,
  accept = '.pdf,.doc,.docx,.txt',
  maxSize = 10,
  label = 'Ficha Técnica',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);

    // Validar tipo de archivo
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (
      !allowedTypes.some(type =>
        type.startsWith('.')
          ? fileExtension === type
          : file.type.match(type.replace('*', '.*'))
      )
    ) {
      setError(`Tipo de archivo no permitido. Tipos permitidos: ${accept}`);
      return;
    }

    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    onChange(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (currentUrl) {
      // Abrir en nueva pestaña en lugar de descargar
      window.open(currentUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          selectedFile
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-2">
          <div className="flex justify-center">
            <FileText
              className={`w-8 h-8 ${selectedFile ? 'text-green-600' : 'text-gray-400'}`}
            />
          </div>
          <div>
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Archivo seleccionado: {selectedFile.name}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Haz clic para cambiar el archivo
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Arrastra un archivo aquí o{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    haz clic para seleccionar
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Tipos permitidos: {accept} (máximo {maxSize}MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      {(currentUrl || selectedFile) && (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {selectedFile
                ? 'Archivo seleccionado'
                : 'Documento actual disponible'}
            </span>
            {selectedFile && (
              <span className="text-xs text-green-700 dark:text-green-300">
                ({selectedFile.name} -{' '}
                {(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {currentUrl && !selectedFile && (
              <button
                type="button"
                onClick={handleDownload}
                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
