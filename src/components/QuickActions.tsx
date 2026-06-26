'use client';

import { Button } from './Button';
import { COLORS } from '@/config/design-tokens';

export interface QuickActionsProps {
  ticker: string;
  ownedShares: number;
  onBuy: () => void;
  onSell: () => void;
}

export function QuickActions({
  ticker,
  ownedShares,
  onBuy,
  onSell,
}: QuickActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:static md:flex md:gap-3 bg-dark-panel border-t md:border-t-0 md:border-l border-dark-border p-4 md:p-0">
      <Button
        onClick={onBuy}
        className="w-full md:w-auto"
        style={{ backgroundColor: COLORS.brand.purple }}
      >
        Buy More {ticker}
      </Button>
      <Button
        onClick={onSell}
        disabled={ownedShares <= 0}
        className="w-full md:w-auto mt-3 md:mt-0"
        variant={ownedShares > 0 ? 'secondary' : 'ghost'}
      >
        Sell {ticker}
        {ownedShares > 0 && ` (${ownedShares.toFixed(4)})`}
      </Button>
    </div>
  );
}
