import React from 'react';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const FormText: React.FC<Props> = ({ label, error, id, className = '', ...props }) => (
  <div>
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
    )}
    <textarea
      id={id}
      {...props}
      className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3 ${error ? 'border-red-500' : ''} ${className}`}
    />
    {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
  </div>
); 