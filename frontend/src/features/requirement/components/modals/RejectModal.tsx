import type { UseMutationResult } from '@tanstack/react-query';
import { Modal } from '../../../../components/common/Modal';
import type { Requirement } from '../../../../types/requirement';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirement: Requirement;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  handleReject: () => void;
  rejectRequirementMutation: UseMutationResult<
    Requirement,
    Error,
    { id: number; reason: string }
  >;
}

export const RejectModal = ({
  isOpen,
  onClose,
  requirement,
  rejectReason,
  setRejectReason,
  handleReject,
  rejectRequirementMutation,
}: RejectModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rechazar Requerimiento">
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-500 text-xl">⚠️</span>
            <h3 className="text-lg font-medium text-red-900 dark:text-red-100">
              Confirmar Rechazo
            </h3>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-2">
            Estás a punto de rechazar el requerimiento{' '}
            <span className="font-medium">{requirement?.code}</span>.
          </p>
        </div>

        <div>
          <label
            htmlFor="rejectReason"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Motivo del Rechazo *
          </label>
          <textarea
            id="rejectReason"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Describe el motivo del rechazo..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
            rows={4}
            required
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleReject}
            disabled={
              rejectRequirementMutation.isPending || !rejectReason.trim()
            }
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rejectRequirementMutation.isPending
              ? 'Rechazando...'
              : 'Confirmar Rechazo'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
