import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  readonly options: Option[];
  readonly value: string[];
  readonly onChange: (value: string[]) => void;
  readonly label?: string;
  readonly placeholder?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder,
}: MultiSelectProps) {
  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block mb-1 font-medium">{label}</label>}
      <Listbox value={value} onChange={onChange} multiple>
        <div className="relative">
          <Listbox.Button
            as="div"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3 h-10"
          >
            <span className="block truncate text-sm">
              {value.length === 0 ? (
                <span className="text-muted-foreground">
                  {placeholder || 'Selecciona...'}
                </span>
              ) : (
                options
                  .filter(o => value.includes(o.value))
                  .map(o => o.label)
                  .join(', ')
              )}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map(option => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  as={Fragment}
                >
                  {({ active }) => (
                    <li
                      className={`
                        list-none cursor-pointer select-none relative py-2 pl-10 pr-4
                        ${active ? 'bg-accent text-accent-foreground' : ''}
                      `}
                      onClick={() => handleSelect(option.value)}
                    >
                      <span
                        className={`block truncate ${value.includes(option.value) ? 'font-semibold' : 'font-normal'}`}
                      >
                        {option.label}
                      </span>
                      {value.includes(option.value) && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </li>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
