import { useState } from 'react';
import { exitPartService } from '../../../services/api/exitPartService';
import { useToast } from '../../../contexts/ToastContext';

export const useExitPartPdf = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { showSuccess, showError } = useToast();

  const downloadPdf = async (id: number) => {
    try {
      setIsDownloading(true);
      const blob = await exitPartService.downloadExitPartPdf(id);

      // Crear URL del blob
      const url = window.URL.createObjectURL(blob);

      // Crear elemento de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `parte-de-salida-${id}.pdf`;

      // Simular clic para descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Liberar URL del blob
      window.URL.revokeObjectURL(url);

      showSuccess('Éxito', 'PDF descargado correctamente');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      showError('Error', 'No se pudo descargar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadPdf,
    isDownloading,
  };
};
