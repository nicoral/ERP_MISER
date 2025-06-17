import React from 'react';

interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onClose,
}) => (
  <div className="flex items-center justify-between bg-red-500/80 text-white px-4 py-3 rounded mb-4 shadow">
    <span className="flex-1">{message}</span>
    <button
      onClick={onClose}
      className="ml-4 hover:bg-red-600 rounded p-1 transition text-xl font-bold bg-transparent"
      aria-label="Cerrar"
      type="button"
    >
      &times;
    </button>
  </div>
);
