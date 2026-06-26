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

// Mock current prices - in production, fetch from MCP servers
const MOCK_PRICES: Record<string, number> = {
  AAPL: 195.45,
  MSFT: 430.12,
  GOOGL: 142.80,
  AMZN: 198.50,
  NVDA: 875.30,
  TSLA: 245.67,
  META: 502.13,
  NFLX: 247.89,
};

function getCurrentPrice(ticker: string): number {
  return MOCK_PRICES[ticker.toUpperCase()] || 100;
}

export function usePortfolio(): UsePortfolioReturn {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
