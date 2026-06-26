'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

export interface PriceData {
  price: number;
  change: number;
  changePct: number;
  companyName: string;
}

export interface UseWatchlistReturn {
  watchlist: string[];
  prices: Record<string, PriceData>;
  loading: boolean;
  pricesLoading: boolean;
  error: string | null;
  addTicker: (ticker: string) => Promise<void>;
  removeTicker: (ticker: string) => Promise<void>;
  isTicker: (ticker: string) => boolean;
  refresh: () => Promise<void>;
}

export function useWatchlist(): UseWatchlistReturn {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pricesCacheRef = useRef<{ timestamp: number; data: Record<string, PriceData> }>({
    timestamp: 0,
    data: {},
  });

  const fetchPrices = async (tickers: string[]) => {
    if (tickers.length === 0) {
      setPrices({});
      return;
    }

    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes

    // Check if cache is still valid
    if (now - pricesCacheRef.current.timestamp < cacheExpiry) {
      setPrices(pricesCacheRef.current.data);
      return;
    }

    try {
      setPricesLoading(true);
      const params = new URLSearchParams({
        tickers: tickers.join(','),
      });

      const response = await fetch(`/api/prices/batch?${params}`);
      if (!response.ok) throw new Error('Failed to fetch prices');

      const data: Array<{
        ticker: string;
        price: number;
        change: number;
        changePct: number;
        companyName: string;
      }> = await response.json();

      const pricesMap = data.reduce(
        (acc, item) => {
          acc[item.ticker] = {
            price: item.price,
            change: item.change,
            changePct: item.changePct,
            companyName: item.companyName,
          };
          return acc;
        },
        {} as Record<string, PriceData>
      );

      setPrices(pricesMap);
      pricesCacheRef.current = { timestamp: now, data: pricesMap };
    } catch (err) {
      console.error('Error fetching prices:', err);
    } finally {
      setPricesLoading(false);
    }
  };

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

  useEffect(() => {
    if (watchlist.length === 0) {
      setPrices({});
      return;
    }

    // Initial fetch
    fetchPrices(watchlist);

    // Set up 5-minute refresh interval
    const interval = setInterval(() => {
      fetchPrices(watchlist);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [watchlist]);

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
    prices,
    loading,
    pricesLoading,
    error,
    addTicker,
    removeTicker,
    isTicker,
    refresh: fetchWatchlist,
  };
}
