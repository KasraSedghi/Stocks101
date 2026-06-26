import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import {
  Transaction,
  Holding,
  PortfolioMetrics,
  aggregatePortfolio,
} from '@/utils/financial';

export interface UsePortfolioReturn {
  transactions: Transaction[];
  holdings: Holding[];
  metrics: PortfolioMetrics | null;
  loading: boolean;
  error: string | null;
  addTransaction: (txn: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioReturn {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (err) throw err;
      setTransactions((data || []) as Transaction[]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.id]);

  // Fetch live prices for held tickers and refresh every 60s.
  const tickerKey = Array.from(
    new Set(transactions.map((t) => t.ticker.toUpperCase()))
  )
    .sort()
    .join(',');

  useEffect(() => {
    if (!tickerKey) {
      setPrices({});
      return;
    }

    let cancelled = false;

    const fetchPrices = async () => {
      try {
        const res = await fetch(`/api/prices/batch?tickers=${tickerKey}`);
        if (!res.ok) return;
        const data: Array<{ ticker: string; price: number }> = await res.json();
        if (cancelled) return;
        setPrices(
          data.reduce(
            (acc, item) => {
              acc[item.ticker.toUpperCase()] = item.price;
              return acc;
            },
            {} as Record<string, number>
          )
        );
      } catch (err) {
        console.error('Error fetching portfolio prices:', err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [tickerKey]);

  // Resolve a current price: live quote first, else most recent transaction
  // price for that ticker (avoids showing $0 before quotes load or on failure).
  const getCurrentPrice = (ticker: string): number => {
    const symbol = ticker.toUpperCase();
    if (prices[symbol] && prices[symbol] > 0) return prices[symbol];
    const lastTxn = transactions.find(
      (t) => t.ticker.toUpperCase() === symbol
    );
    return lastTxn?.price_per_share ?? 0;
  };

  // Calculate metrics
  const metrics = transactions.length > 0
    ? aggregatePortfolio(
        transactions,
        Object.fromEntries(
          transactions.map((t) => [
            t.ticker,
            getCurrentPrice(t.ticker),
          ])
        )
      )
    : null;

  const holdings = metrics?.holdings || [];

  const addTransaction = async (
    txn: Omit<Transaction, 'id' | 'user_id' | 'created_at'>
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: err } = await supabase.from('transactions').insert({
        ...txn,
        user_id: user.id,
      });

      if (err) throw err;
      await fetchTransactions();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add transaction';
      setError(message);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: err } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (err) throw err;
      await fetchTransactions();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(message);
      throw err;
    }
  };

  return {
    transactions,
    holdings,
    metrics,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    refresh: fetchTransactions,
  };
}
