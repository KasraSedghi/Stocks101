'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Transaction } from '@/utils/financial';

export type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '3Y' | 'MAX';

export interface ChartData {
  date: string;
  price: number;
}

interface CacheEntry {
  data: ChartData[];
  timestamp: number;
}

const TTL: Record<Timeframe, number> = {
  '1D': 5 * 60 * 1000,        // 5 min
  '5D': 15 * 60 * 1000,       // 15 min
  '1M': 60 * 60 * 1000,       // 1 hour
  '3M': 4 * 60 * 60 * 1000,   // 4 hours
  '6M': 24 * 60 * 60 * 1000,  // 1 day
  '1Y': 24 * 60 * 60 * 1000,  // 1 day
  '3Y': 7 * 24 * 60 * 60 * 1000, // 1 week
  'MAX': 7 * 24 * 60 * 60 * 1000, // 1 week
};

export function usePriceChart(
  ticker: string,
  transactions: Transaction[] = []
) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframeState] = useState<Timeframe>('1M');
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const prefetchRef = useRef<Set<string>>(new Set());

  const getCacheKey = useCallback((tf: Timeframe) => {
    return `${ticker.toUpperCase()}:${tf}`;
  }, [ticker]);

  const isCacheFresh = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    if (!entry) return false;
    const timeframeFromKey = key.split(':')[1] as Timeframe;
    const age = Date.now() - entry.timestamp;
    return age < TTL[timeframeFromKey];
  }, []);

  const fetchPrices = useCallback(
    async (tf: Timeframe, skipCache = false) => {
      const cacheKey = getCacheKey(tf);

      // Check cache first
      if (!skipCache && isCacheFresh(cacheKey)) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
          setData(cached.data);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/prices?ticker=${ticker.toUpperCase()}&timeframe=${tf}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch price data');
        }

        const result = await response.json();
        const chartData: ChartData[] = result.dates.map(
          (date: string, index: number) => ({
            date,
            price: result.prices[index],
          })
        );

        // Cache the result
        cacheRef.current.set(cacheKey, {
          data: chartData,
          timestamp: Date.now(),
        });

        setData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [ticker, getCacheKey, isCacheFresh]
  );

  const setTimeframe = useCallback((tf: Timeframe) => {
    setTimeframeState(tf);
    fetchPrices(tf);
  }, [fetchPrices]);

  const prefetchTimeframe = useCallback((tf: Timeframe) => {
    const cacheKey = getCacheKey(tf);
    if (isCacheFresh(cacheKey) || prefetchRef.current.has(cacheKey)) {
      return;
    }
    prefetchRef.current.add(cacheKey);
    fetchPrices(tf, false).then(() => {
      prefetchRef.current.delete(cacheKey);
    });
  }, [getCacheKey, isCacheFresh, fetchPrices]);

  // Initial load
  useEffect(() => {
    fetchPrices(timeframe);
  }, [ticker]); // Only refetch when ticker changes

  // Filter transaction markers for current timeframe
  const transactionMarkers = transactions
    .filter((txn) => txn.ticker.toUpperCase() === ticker.toUpperCase())
    .map((txn) => {
      const txnDate = new Date(txn.transaction_date).toISOString().split('T')[0];
      const dataPoint = data.find((d) => d.date === txnDate);
      return {
        ...txn,
        dateStr: txnDate,
        price: dataPoint?.price || txn.price_per_share,
      };
    })
    .slice(0, 20); // Cap at 20 visible markers

  return {
    data,
    loading,
    error,
    timeframe,
    setTimeframe,
    prefetchTimeframe,
    transactionMarkers,
  };
}
