import { Modal } from '../../../../components/common/Modal';
import { FormInputFile } from '../../../../components/common/FormInputFile';
import { Loader2 } from 'lucide-react';

interface UploadInformModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleInformChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  isLoading?: boolean;
}

export const UploadInformModal = ({
  isOpen,
  onClose,
  handleInformChange,
  handleSubmit,
  isLoading = false,
}: UploadInformModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Subir Informe">
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-500 text-xl">⚠️</span>
            <h3 className="text-lg font-medium text-red-900 dark:text-red-100">
              Subir Informe
            </h3>
            <FormInputFile
              label="Informe"
              name="inform"
              accept="application/pdf"
              onChange={handleInformChange}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? 'Subiendo...' : 'Subir'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
