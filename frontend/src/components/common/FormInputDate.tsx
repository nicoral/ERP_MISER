import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const FormInputDate: React.FC<Props> = ({
  label,
  error,
  id,
  className = '',
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
    <input
      id={id}
      type="date"
      {...props}
      className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 focus:ring-1 text-base py-2 px-3 h-10 disabled:bg-gray-100 disabled:text-gray-500 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
    />
    {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
  </div>
);
