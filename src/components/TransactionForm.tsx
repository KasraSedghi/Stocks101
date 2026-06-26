'use client';

import { useState } from 'react';
import { usePortfolio } from '@/hooks';
import { useToast } from '@/hooks';
import {
  validateTransaction,
  calculateEstimatedRealizedGain,
  formatCurrency,
} from '@/utils/financial';
import { COLORS } from '@/config/design-tokens';
import { Button, Input, NumberInput, DatePicker } from '@/components';

export interface TransactionFormProps {
  ticker: string;
  transactionType: 'BUY' | 'SELL';
  maxShares?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({
  ticker,
  transactionType: initialType,
  maxShares,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const { addTransaction, holdings } = usePortfolio();
  const { success, error: errorToast } = useToast();

  const [type, setType] = useState<'BUY' | 'SELL'>(initialType);
  const [shares, setShares] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const holding = holdings.find((h) => h.ticker === ticker.toUpperCase());
  const ownedShares = holding?.shares || 0;

  const estimatedRealizedGain =
    type === 'SELL' && holding && shares && price
      ? calculateEstimatedRealizedGain(holding, shares, parseFloat(price))
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shares) {
      errorToast('Shares is required');
      return;
    }

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
      onSuccess?.();
    } catch (err) {
      errorToast(
        err instanceof Error ? err.message : 'Failed to add transaction'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              <span
                className={`font-medium ${
                  type === txnType ? 'text-brand-purple' : 'text-gray-400'
                }`}
              >
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
          max={type === 'SELL' && maxShares ? maxShares : undefined}
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
        <div className="relative">
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="pl-8"
          />
          <span className="absolute left-3 top-3 text-gray-400">$</span>
        </div>
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

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={
            loading || !price || shares === null || shares <= 0
          }
          loading={loading}
          className="flex-1"
        >
          {type === 'BUY' ? 'Record Buy' : 'Record Sell'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
