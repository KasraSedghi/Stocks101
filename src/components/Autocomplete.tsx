'use client';

import { useState, useCallback, useRef } from 'react';
import { Input } from './Input';
import { cn } from '@/lib/utils';

interface AutocompleteProps {
  options: string[];
  onSelect: (option: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
}

export function Autocomplete({
  options,
  onSelect,
  placeholder = 'Search...',
  label,
  error,
  required,
}: AutocompleteProps) {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [filtered, setFiltered] = useState<string[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFilter = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFiltered([]);
        setIsOpen(false);
        return;
      }

      const results = options.filter((opt) =>
        opt.toLowerCase().includes(query.toLowerCase())
      );

      setFiltered(results);
      setIsOpen(results.length > 0);
      setActiveIndex(-1);
    },
    [options]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      handleFilter(newValue);
    }, 200);
  };

  const handleSelect = (option: string) => {
    setValue(option);
    onSelect(option);
    setIsOpen(false);
    setFiltered([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filtered.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSelect(filtered[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-brand-purple/30 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => value && filtered.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        label={label}
        error={error}
        required={required}
      />

      {isOpen && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-dark-panel border border-dark-border rounded-md shadow-lg z-dropdown max-h-64 overflow-y-auto">
          {filtered.map((option, index) => (
            <li
              key={option}
              onClick={() => handleSelect(option)}
              className={cn(
                'px-4 py-2 cursor-pointer transition-colors',
                index === activeIndex
                  ? 'bg-brand-purple text-white'
                  : 'text-gray-300 hover:bg-dark-surface'
              )}
            >
              {highlightMatch(option, value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
