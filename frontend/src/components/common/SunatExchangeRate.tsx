import React from 'react';
import { useCurrentSaleRate } from '../../hooks/useGeneralSettings';
import { LoadingSpinner } from './LoadingSpinner';

interface SunatExchangeRateProps {
  className?: string;
  showDate?: boolean;
}

export const SunatExchangeRate: React.FC<SunatExchangeRateProps> = ({
  className = '',
  showDate = false,
}) => {
  const { data, isLoading, error } = useCurrentSaleRate();

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-500">
          Cargando tipo de cambio...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm text-red-500">
          Error al cargar tipo de cambio
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium">
        USD: S/ {data.saleRate.toFixed(3)}
      </span>
      {showDate && <span className="text-xs text-gray-500">({data.date})</span>}
    </div>
  );
};
