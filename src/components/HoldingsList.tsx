'use client';

import { Holding } from '@/utils/financial';
import { COLORS } from '@/config/design-tokens';
import { formatCurrency, formatPercent } from '@/utils/financial';
import { Card } from './Card';
import { Skeleton } from './Skeleton';

export interface HoldingsListProps {
  holdings: Holding[];
  totalValue: number;
  loading?: boolean;
}

export function HoldingsList({ holdings, totalValue, loading }: HoldingsListProps) {
  const sorted = [...holdings].sort((a, b) => b.currentValue - a.currentValue);

  return (
    <Card title="Holdings" noPadding>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border bg-dark-surface/50">
              <th className="px-6 py-4 text-left text-gray-400 font-medium">
                Ticker
              </th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium">
                Shares
              </th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium">
                Avg Cost
              </th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium">
                Current
              </th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium">
                Unrealized
              </th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium">
                Alloc %
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-dark-border">
                  <td className="px-6 py-4">
                    <Skeleton variant="line" className="w-12 h-4" />
                  </td>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4 text-right">
                      <Skeleton variant="line" className="w-20 h-4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No holdings yet. Add a transaction to get started.
                </td>
              </tr>
            ) : (
              sorted.map((holding) => {
                const allocPct =
                  totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0;
                const gainColor =
                  holding.unrealizedGain >= 0
                    ? COLORS.neon.green
                    : COLORS.neon.red;

                return (
                  <tr
                    key={holding.ticker}
                    className="border-b border-dark-border hover:bg-dark-surface/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <a
                        href={`/stock/${holding.ticker}`}
                        className="font-bold text-brand-purple hover:underline"
                      >
                        {holding.ticker}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      {holding.shares.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      {formatCurrency(holding.costBasis)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td
                      className="px-6 py-4 text-right font-bold"
                      style={{ color: gainColor }}
                    >
                      {formatCurrency(holding.unrealizedGain)}
                      <div className="text-xs font-normal opacity-75">
                        {formatPercent(holding.unrealizedGainPct, false)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      <div className="flex items-center justify-end gap-2">
                        <span>{allocPct.toFixed(1)}%</span>
                        <div
                          className="w-16 h-2 bg-dark-border rounded-full overflow-hidden"
                          style={{
                            background: `linear-gradient(to right, ${COLORS.brand.purple}, ${COLORS.brand.purple})`,
                          }}
                        >
                          <div
                            style={{
                              width: `${allocPct}%`,
                              height: '100%',
                              backgroundColor: COLORS.neon.green,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
