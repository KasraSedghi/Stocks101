'use client';

import { ReactNode } from 'react';
import { Card } from './Card';
import { COLORS } from '@/config/design-tokens';

export interface KPIBadgeProps {
  label: string;
  value: string;
  subValue?: string;
  icon: ReactNode;
  color?: 'neutral' | 'positive' | 'negative';
}

export function KPIBadge({
  label,
  value,
  subValue,
  icon,
  color = 'neutral',
}: KPIBadgeProps) {
  const colorMap = {
    neutral: 'text-gray-400',
    positive: `text-[${COLORS.neon.green}]`,
    negative: `text-[${COLORS.neon.red}]`,
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-2">{label}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subValue && (
            <p className={`text-sm font-medium ${colorMap[color]}`}>{subValue}</p>
          )}
        </div>
        <div
          className={`flex-shrink-0 ${colorMap[color]} opacity-60`}
          style={{
            color:
              color === 'positive'
                ? COLORS.neon.green
                : color === 'negative'
                  ? COLORS.neon.red
                  : 'currentColor',
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
