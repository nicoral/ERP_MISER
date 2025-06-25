import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDownIcon } from './Icons';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  id: string;
  name: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción',
  required = false,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar opciones basado en el término de búsqueda
  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  // Encontrar la opción seleccionada basada en el valor
  useEffect(() => {
    const selected = options.find(option => option.value === value);
    if (selected) {
      setSearchTerm(selected.label);
    } else if (value === 0 || value === '') {
      setSearchTerm('');
    }
  }, [value, options]);

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = e.target.value;
      setSearchTerm(newSearchTerm);
      setIsOpen(true);

      // Si el usuario borra todo el texto, limpiar la selección
      if (newSearchTerm === '') {
        const syntheticEvent = {
          target: {
            name,
            value: '0',
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    },
    [name, onChange]
  );

  const handleOptionClick = useCallback(
    (option: Option) => {
      setSearchTerm(option.label);
      setIsOpen(false);

      // Simular el evento onChange del input original
      const syntheticEvent = {
        target: {
          name,
          value: option.value.toString(),
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    },
    [name, onChange]
  );

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleInputClick = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && isOpen && filteredOptions.length > 0) {
        e.preventDefault();
        handleOptionClick(filteredOptions[0]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [isOpen, filteredOptions, handleOptionClick]
  );

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          name={name}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 text-base py-2 px-3 h-10 pr-10 disabled:bg-gray-100 disabled:text-gray-500 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : ''
          }`}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.value}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}

      {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
    </div>
  );
};
