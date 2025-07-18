import { Modal } from '../../../../components/common/Modal';
import { FormInputFile } from '../../../../components/common/FormInputFile';

interface UploadInformModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleInformChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
}

export const UploadInformModal = ({
  isOpen,
  onClose,
  handleInformChange,
  handleSubmit,
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
            />
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Subir
          </button>
        </div>
      </div>
    </Modal>
  );
};
