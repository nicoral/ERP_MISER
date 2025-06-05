import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const FormCheckbox: React.FC<Props> = ({ label, error, id, className = '', ...props }) => (
  <div className="flex items-center">
    <input
      id={id}
      type="checkbox"
      {...props}
      className={`rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 h-5 w-5 ${className}`}
    />
    {label && (
      <label htmlFor={id} className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    {error && <div className="text-red-600 text-xs ml-2">{error}</div>}
  </div>
); 