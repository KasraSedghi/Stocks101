'use client';

import { useState, useRef, useEffect } from 'react';
import {
  startOfMonth,
  isSameMonth,
  isSameDay,
  isAfter,
  addMonths,
  subMonths,
  format,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export function DatePicker({ value = new Date(), onChange, label }: DatePickerProps) {
  const [month, setMonth] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleSelect = (day: Date) => {
    onChange(day);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setMonth((prev) => subMonths(prev, 1));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setMonth((prev) => addMonths(prev, 1));
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-2.5 bg-dark-panel border border-dark-border rounded-md',
          'text-white text-left transition-colors duration-normal',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple',
          isOpen && 'ring-2 ring-brand-purple'
        )}
      >
        {format(value, 'MMM d, yyyy')}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-dark-panel border border-dark-border rounded-lg shadow-lg z-dropdown p-4 min-w-max">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setMonth((prev) => subMonths(prev, 1))}
              onKeyDown={handleKeyDown}
              className="p-1 hover:bg-dark-surface rounded transition-colors text-gray-400 hover:text-white"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-sm font-semibold text-white">
              {format(month, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => setMonth((prev) => addMonths(prev, 1))}
              onKeyDown={handleKeyDown}
              className="p-1 hover:bg-dark-surface rounded transition-colors text-gray-400 hover:text-white"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-400 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="w-8 h-8 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const day = new Date(startOfMonth(month));
              day.setDate(day.getDate() - day.getDay() + i);

              return (
                <button
                  key={day.toString()}
                  onClick={() => isSameMonth(day, month) && handleSelect(day)}
                  disabled={isAfter(day, today) || !isSameMonth(day, month)}
                  className={cn(
                    'w-8 h-8 rounded text-xs transition-colors',
                    isSameDay(day, value)
                      ? 'bg-brand-purple text-white font-semibold'
                      : isSameMonth(day, month) && !isAfter(day, today)
                      ? 'text-white hover:bg-dark-surface'
                      : 'text-gray-600 cursor-not-allowed'
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
