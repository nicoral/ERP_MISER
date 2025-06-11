import React from 'react';
import type { FormSelectProps } from '../../../types/form';

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  id,
  className = '',
  children,
  ...props
}) => (
  <div>
    {label && (
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
    )}
    <select
      id={id}
      {...props}
      className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3 h-10 ${error ? 'border-red-500' : ''} ${className}`}
    >
      {children}
    </select>
    {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
  </div>
);
