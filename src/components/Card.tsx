'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  noPadding?: boolean;
  className?: string;
}

export function Card({
  title,
  subtitle,
  children,
  footer,
  noPadding = false,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-dark-panel border border-dark-border rounded-lg transition-shadow duration-normal hover:shadow-glow',
        className
      )}
    >
      {(title || subtitle) && (
        <div className={cn('border-b border-dark-border', !noPadding && 'px-6 py-4')}>
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'px-6 py-4'}>{children}</div>
      {footer && (
        <div className={cn('border-t border-dark-border', !noPadding && 'px-6 py-4')}>
          {footer}
        </div>
      )}
    </div>
  );
}
