import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const FormInputFile: React.FC<Props> = ({ label, error, id, className = '', ...props }) => (
  <div>
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
    )}
    <input
      id={id}
      type="file"
      {...props}
      className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3 h-10 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${error ? 'border-red-500' : ''} ${className}`}
    />
    {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
  </div>
);