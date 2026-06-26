'use client';

import { forwardRef, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, leftIcon, rightIcon, className, type = 'text', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-white mb-2"
          >
            {label}
            {required && <span className="text-neon-red ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 bg-dark-panel border border-dark-border rounded-md',
              'text-white placeholder-gray-500 transition-colors duration-normal',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:border-brand-purple',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-neon-red focus-visible:ring-neon-red',
              leftIcon && 'pl-10',
              (rightIcon || isPassword) && 'pr-10',
              className
            )}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-auto">
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
            {rightIcon && !isPassword && (
              <span className="text-gray-400">{rightIcon}</span>
            )}
          </div>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-neon-red">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
