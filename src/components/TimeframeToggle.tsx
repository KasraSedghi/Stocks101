'use client';

import { Timeframe } from '@/hooks/usePriceChart';
import { COLORS } from '@/config/design-tokens';

export interface TimeframeToggleProps {
  activeTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  onHover?: (timeframe: Timeframe) => void;
}

const TIMEFRAMES: Timeframe[] = ['1D', '5D', '1M', '3M', '6M', '1Y', '3Y', 'MAX'];

export function TimeframeToggle({
  activeTimeframe,
  onTimeframeChange,
  onHover,
}: TimeframeToggleProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {TIMEFRAMES.map((tf) => {
        const isActive = tf === activeTimeframe;
        return (
          <button
            key={tf}
            onClick={() => onTimeframeChange(tf)}
            onMouseEnter={() => onHover?.(tf)}
            className="px-3 py-2 rounded text-sm font-medium transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{
              backgroundColor: isActive ? `${COLORS.brand.purple}20` : 'transparent',
              color: isActive ? COLORS.brand.purple : COLORS.gray[400],
              border: `1px solid ${
                isActive ? COLORS.brand.purple : COLORS.dark.border
              }`,
            }}
          >
            {tf}
          </button>
        );
      })}
    </div>
  );
}
