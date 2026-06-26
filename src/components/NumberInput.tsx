'use client';

import { forwardRef, useState, useCallback } from 'react';
import { Input } from './Input';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  error?: string;
  required?: boolean;
  prefix?: string;
  decimalPlaces?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number | null) => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      prefix = '',
      decimalPlaces = 0,
      min,
      max,
      step = 1,
      onChange,
      value: initialValue,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useState<string>(
      initialValue ? String(initialValue) : ''
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        if (newValue === '') {
          setValue('');
          onChange?.(null);
          return;
        }

        const numValue = parseFloat(newValue);
        if (isNaN(numValue)) return;

        if (min !== undefined && numValue < min) newValue = String(min);
        if (max !== undefined && numValue > max) newValue = String(max);

        const formatted = parseFloat(newValue).toFixed(decimalPlaces);
        setValue(formatted);
        onChange?.(parseFloat(formatted));
      },
      [min, max, decimalPlaces, onChange]
    );

    const handleIncrement = () => {
      const current = value ? parseFloat(value) : 0;
      const newValue = current + (step || 1);
      if (max === undefined || newValue <= max) {
        const formatted = newValue.toFixed(decimalPlaces);
        setValue(formatted);
        onChange?.(parseFloat(formatted));
      }
    };

    const handleDecrement = () => {
      const current = value ? parseFloat(value) : 0;
      const newValue = current - (step || 1);
      if (min === undefined || newValue >= min) {
        const formatted = newValue.toFixed(decimalPlaces);
        setValue(formatted);
        onChange?.(parseFloat(formatted));
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="number"
          value={value}
          onChange={handleChange}
          step={step}
          className="pr-14"
          {...props}
        />
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
          <button
            type="button"
            onClick={handleIncrement}
            className="p-1 hover:bg-dark-surface rounded transition-colors text-gray-400 hover:text-white"
            aria-label="Increase value"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="p-1 hover:bg-dark-surface rounded transition-colors text-gray-400 hover:text-white"
            aria-label="Decrease value"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
