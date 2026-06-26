'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

export interface UseWatchlistReturn {
  watchlist: string[];
  loading: boolean;
  error: string | null;
  addTicker: (ticker: string) => Promise<void>;
  removeTicker: (ticker: string) => Promise<void>;
  isTicker: (ticker: string) => boolean;
  refresh: () => Promise<void>;
}

export function useWatchlist(): UseWatchlistReturn {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = async () => {
    if (!user) {
      setWatchlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('watchlists')
        .select('ticker')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setWatchlist((data || []).map((w: any) => w.ticker.toUpperCase()));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch watchlist';
      setError(message);
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [user?.id]);

  const addTicker = async (ticker: string) => {
    if (!user) throw new Error('User not authenticated');

    const upperTicker = ticker.toUpperCase();
    if (watchlist.includes(upperTicker)) return;

    try {
      const { error: err } = await supabase
        .from('watchlists')
        .insert({
          user_id: user.id,
          ticker: upperTicker,
        });

      if (err) {
        if (err.code === '23505') {
          // Unique constraint violation - already exists
          return;
        }
        throw err;
      }

      setWatchlist([...watchlist, upperTicker]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add to watchlist';
      setError(message);
      throw err;
    }
  };

  const removeTicker = async (ticker: string) => {
    if (!user) throw new Error('User not authenticated');

    const upperTicker = ticker.toUpperCase();
    try {
      const { error: err } = await supabase
        .from('watchlists')
        .delete()
        .eq('user_id', user.id)
        .eq('ticker', upperTicker);

      if (err) throw err;
      setWatchlist(watchlist.filter((t) => t !== upperTicker));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to remove from watchlist';
      setError(message);
      throw err;
    }
  };

  const isTicker = (ticker: string): boolean => {
    return watchlist.includes(ticker.toUpperCase());
  };

  return {
    watchlist,
    loading,
    error,
    addTicker,
    removeTicker,
    isTicker,
    refresh: fetchWatchlist,
  };
}
