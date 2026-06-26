'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Spinner } from './Spinner';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-dark-base disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-brand-purple text-white hover:bg-brand-purple-light active:bg-brand-purple-dark',
        secondary: 'bg-transparent border border-dark-border text-white hover:bg-dark-surface hover:border-dark-border active:bg-dark-panel',
        danger: 'bg-neon-red text-white hover:bg-neon-red-light active:bg-neon-red-dark',
        ghost: 'bg-transparent text-white hover:bg-dark-surface active:bg-dark-panel',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant,
  size,
  loading = false,
  fullWidth = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          {children}
        </>
      ) : (
        <>
          {leftIcon && <span>{leftIcon}</span>}
          {children}
          {rightIcon && <span>{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
