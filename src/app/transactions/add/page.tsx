'use client';

import { useState } from 'react';
import { ProtectedRoute, Button, Card, Input, NumberInput, DatePicker, ErrorBoundary } from '@/components';
import { Layout } from '@/components';
import { usePortfolio } from '@/hooks';
import { useToast } from '@/hooks';
import { validateTransaction, calculateEstimatedRealizedGain, formatCurrency } from '@/utils/financial';
import { COLORS } from '@/config/design-tokens';

export default function AddTransactionPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ErrorBoundary>
          <AddTransactionForm />
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

function AddTransactionForm() {
  const { addTransaction, holdings, loading: portfolioLoading } = usePortfolio();
  const { success, error: errorToast } = useToast();

  const [ticker, setTicker] = useState('');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Get unique tickers from holdings + common ones
  const commonTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX'];
  const existingTickers = holdings.map((h) => h.ticker);
  const allTickers = Array.from(
    new Set([...existingTickers, ...commonTickers])
  ).sort();

  const filteredTickers = allTickers.filter((t) =>
    t.startsWith(ticker.toUpperCase())
  );

  const holding = holdings.find((h) => h.ticker === ticker.toUpperCase());
  const ownedShares = holding?.shares || 0;

  const estimatedRealizedGain =
    type === 'SELL' && holding && shares && price
      ? calculateEstimatedRealizedGain(
          holding,
          shares,
          parseFloat(price)
        )
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shares) {
      errorToast('Shares is required');
      return;
    }

    // Validate
    const validation = validateTransaction(
      {
        ticker: ticker.toUpperCase(),
        transaction_type: type,
        shares,
        price_per_share: parseFloat(price),
        transaction_date: date.toISOString().split('T')[0],
      },
      holdings
    );

    if (!validation.valid) {
      errorToast(validation.error || 'Invalid transaction');
      return;
    }

    try {
      setLoading(true);
      await addTransaction({
        ticker: ticker.toUpperCase(),
        transaction_type: type,
        shares,
        price_per_share: parseFloat(price),
        transaction_date: date.toISOString().split('T')[0],
      });

      success(`${type} ${shares} shares of ${ticker.toUpperCase()} recorded`);

      // Reset form
      setTicker('');
      setShares(null);
      setPrice('');
      setDate(new Date());
    } catch (err) {
      errorToast(
        err instanceof Error ? err.message : 'Failed to add transaction'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Add Transaction</h1>
        <p className="text-gray-400">Record a buy or sell transaction</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ticker */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ticker <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={ticker}
              onChange={(e) => {
                setTicker(e.target.value.toUpperCase());
                setShowAutocomplete(true);
              }}
              onFocus={() => setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 100)}
              placeholder="AAPL, MSFT, GOOGL..."
              maxLength={5}
            />
            {showAutocomplete && filteredTickers.length > 0 && (
              <ul className="absolute top-full left-0 right-0 mt-1 bg-dark-panel border border-dark-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredTickers.map((t) => (
                  <li
                    key={t}
                    className="px-3 py-2 hover:bg-dark-surface cursor-pointer text-gray-300 text-sm"
                    onClick={() => {
                      setTicker(t);
                      setShowAutocomplete(false);
                    }}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {(['BUY', 'SELL'] as const).map((txnType) => (
                <label
                  key={txnType}
                  className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                    type === txnType
                      ? `border-brand-purple bg-brand-purple/10`
                      : `border-dark-border bg-dark-panel hover:border-gray-600`
                  }`}
                >
                  <input
                    type="radio"
                    value={txnType}
                    checked={type === txnType}
                    onChange={(e) => setType(e.target.value as 'BUY' | 'SELL')}
                    className="mr-2"
                  />
                  <span className={`font-medium ${
                    type === txnType ? 'text-brand-purple' : 'text-gray-400'
                  }`}>
                    {txnType}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Shares */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Shares <span className="text-red-500">*</span>
            </label>
            <NumberInput
              value={shares || undefined}
              onChange={(val) => setShares(val)}
              placeholder="0.0000"
              decimalPlaces={4}
              min={0.0001}
            />
            {type === 'SELL' && (
              <div className="mt-2 text-sm text-gray-400">
                You own{' '}
                <span className="text-brand-purple font-medium">
                  {ownedShares.toFixed(4)}
                </span>{' '}
                shares
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price per Share <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="pl-8"
            />
            <span className="absolute top-10 left-3 text-gray-400">$</span>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Date <span className="text-red-500">*</span>
            </label>
            <DatePicker value={date} onChange={(d) => setDate(d)} />
          </div>

          {/* Estimated Realized Gain (SELL only) */}
          {type === 'SELL' && estimatedRealizedGain !== 0 && (
            <div className="p-4 bg-dark-panel border border-dark-border rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Estimated Realized Gain</p>
              <p
                className="text-xl font-bold"
                style={{
                  color:
                    estimatedRealizedGain >= 0
                      ? COLORS.neon.green
                      : COLORS.neon.red,
                }}
              >
                {formatCurrency(estimatedRealizedGain)}
              </p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || portfolioLoading || !ticker || shares === null || !price}
            loading={loading}
            fullWidth
          >
            {type === 'BUY' ? 'Record Buy' : 'Record Sell'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
