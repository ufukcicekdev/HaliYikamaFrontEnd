'use client';

import { useState, useRef, useEffect } from 'react';
import { FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  label?: string;
  showIcon?: boolean;
  placeholder?: string;
  className?: string;
}

export default function FilterSelect({
  value,
  onChange,
  options,
  label,
  showIcon = true,
  placeholder = 'Seçiniz',
  className = '',
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`} ref={dropdownRef}>
      {showIcon && <FunnelIcon className="h-5 w-5 text-blue-500" />}
      {label && (
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {label}
        </label>
      )}
      
      <div className="relative min-w-[180px]">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-900">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${
                  option.value === value
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Predefined filter options for common use cases
export const STATUS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'pending', label: 'Bekleyen' },
  { value: 'confirmed', label: 'Onaylanan' },
  { value: 'in_progress', label: 'İşlemde' },
  { value: 'completed', label: 'Tamamlanan' },
  { value: 'cancelled', label: 'İptal Edilen' },
];

export const DATE_RANGE_OPTIONS: FilterOption[] = [
  { value: '7', label: 'Son 7 Gün' },
  { value: '30', label: 'Son 30 Gün' },
  { value: '90', label: 'Son 90 Gün' },
  { value: '365', label: 'Son 1 Yıl' },
];
