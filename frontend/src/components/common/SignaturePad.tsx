import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { TrashIcon, DownloadIcon } from './Icons';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onClear: () => void;
  existingSignature?: string;
  disabled?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onClear,
  disabled = false,
}) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
    onClear();
  };

  const handleSave = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL('image/png');
      onSave(signatureData);
    }
  };

  const handleBegin = () => {
    setIsDrawing(true);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const isEmpty = () => {
    return signatureRef.current?.isEmpty() ?? true;
  };

  return (
    <div className="space-y-4">
      {/* Canvas container */}
      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            className: 'w-full h-64 cursor-crosshair',
            style: {
              border: 'none',
              backgroundColor: 'white',
            },
          }}
          onBegin={handleBegin}
          onEnd={handleEnd}
          backgroundColor="white"
          penColor="black"
          minWidth={2}
          maxWidth={3}
        />
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <p className="font-medium mb-1">Instrucciones:</p>
        <ul className="space-y-1 text-xs">
          <li>• Dibuja tu firma en el área blanca</li>
          <li>• Usa el mouse o el dedo en dispositivos táctiles</li>
          <li>• La firma se guardará automáticamente como imagen PNG</li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled || isEmpty()}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <TrashIcon className="w-4 h-4" />
          <span>Limpiar</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || isEmpty()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <DownloadIcon className="w-4 h-4" />
          <span>Guardar Firma</span>
        </button>
      </div>

      {/* Status indicator */}
      {isDrawing && (
        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
          <span>Dibujando...</span>
        </div>
      )}
    </div>
  );
};
