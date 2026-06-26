'use client';

import { Transaction } from '@/utils/financial';
import { COLORS } from '@/config/design-tokens';
import { formatCurrency } from '@/utils/financial';
import { Card } from './Card';
import { Skeleton } from './Skeleton';
import { Button } from './Button';

export interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function RecentTransactions({
  transactions,
  loading,
}: RecentTransactionsProps) {
  const recent = transactions.slice(0, 8);

  return (
    <Card title="Recent Transactions" noPadding>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border bg-dark-surface/50">
              <th className="px-6 py-4 text-left text-gray-400 font-medium">
                Date
              </th>
              <th className="px-6 py-4 text-left text-gray-400 font-medium">
                Ticker
              </th>
              <th className="px-6 py-4 text-left text-gray-400 font-medium">
                Type
              </th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium">
                Shares
              </th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-dark-border">
                  <td className="px-6 py-4">
                    <Skeleton variant="line" className="w-24 h-4" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton variant="line" className="w-12 h-4" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton variant="line" className="w-16 h-4" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Skeleton variant="line" className="w-20 h-4" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Skeleton variant="line" className="w-20 h-4" />
                  </td>
                </tr>
              ))
            ) : recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No transactions yet. Add your first trade.
                </td>
              </tr>
            ) : (
              recent.map((txn) => {
                const total = txn.shares * txn.price_per_share;
                const isBuy = txn.transaction_type === 'BUY';

                return (
                  <tr
                    key={txn.id}
                    className="border-b border-dark-border hover:bg-dark-surface/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(txn.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white">
                        {txn.ticker}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{
                          backgroundColor: isBuy
                            ? `${COLORS.neon.green}20`
                            : `${COLORS.neon.red}20`,
                          color: isBuy
                            ? COLORS.neon.green
                            : COLORS.neon.red,
                        }}
                      >
                        {txn.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      {txn.shares.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-dark-border flex justify-end">
        <Button
          onClick={() => (window.location.href = '/transactions')}
          variant="secondary"
          size="sm"
        >
          View all →
        </Button>
      </div>
    </Card>
  );
}
