import React, { useId } from 'react';

interface FormSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const FormSwitch: React.FC<FormSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className="relative inline-flex items-center cursor-pointer"
    >
      <input
        type="checkbox"
        id={id}
        className="sr-only peer"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div
        className={`relative w-10 h-6 rounded-full transition-colors duration-200 ease-in-out peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        ></div>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}
    </label>
  );
};
