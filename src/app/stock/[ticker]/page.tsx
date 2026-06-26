'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePortfolio, usePriceChart } from '@/hooks';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useToast } from '@/hooks';
import {
  ProtectedRoute,
  Layout,
  PriceChart,
  StockMetrics,
  QuickActions,
  Modal,
  Card,
  ChatTerminal,
  ErrorBoundary,
} from '@/components';
import { TransactionForm } from '@/components/TransactionForm';
import { ChevronLeft, Star, MessageSquare } from 'lucide-react';
import { COLORS } from '@/config/design-tokens';

interface StockMetricsData {
  ticker: string;
  price: number;
  dayChange: number;
  dayChangePct: number;
  high52w: number;
  low52w: number;
  volume: number;
  marketCap: number;
  pe: number;
  beta: number;
  eps: number;
  dividendYield: number;
  sharesOutstanding: number;
}

export default function StockDetailPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ErrorBoundary>
          <StockDetail />
        </ErrorBoundary>
      </Layout>
    </ProtectedRoute>
  );
}

function StockDetail() {
  const router = useRouter();
  const params = useParams();
  const ticker = (params.ticker as string).toUpperCase();

  const { holdings, transactions } = usePortfolio();
  const { data: chartData, loading: chartLoading, error: chartError, timeframe, setTimeframe, prefetchTimeframe, transactionMarkers } = usePriceChart(
    ticker,
    transactions.filter((t) => t.ticker.toUpperCase() === ticker)
  );
  const { addTicker, removeTicker, isTicker } = useWatchlist();
  const { success, error: errorToast, info } = useToast();

  const [metricsData, setMetricsData] = useState<StockMetricsData | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
  const [chatOpen, setChatOpen] = useState(false);

  const holding = holdings.find((h) => h.ticker === ticker);
  const ownedShares = holding?.shares || 0;

  // Fetch stock metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setMetricsLoading(true);
        const response = await fetch(`/api/stock/${ticker}/metrics`);
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetricsData(data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
  }, [ticker]);

  const handleAddToWatchlist = async () => {
    try {
      if (isTicker(ticker)) {
        await removeTicker(ticker);
        info(`${ticker} removed from watchlist`);
      } else {
        await addTicker(ticker);
        success(`${ticker} added to watchlist`);
      }
    } catch (err) {
      errorToast('Failed to update watchlist');
    }
  };

  const handleBuy = () => {
    setTransactionType('BUY');
    setTransactionModalOpen(true);
  };

  const handleSell = () => {
    setTransactionType('SELL');
    setTransactionModalOpen(true);
  };

  const handleTransactionComplete = () => {
    setTransactionModalOpen(false);
    success('Transaction recorded successfully');
  };

  const dayChangeColor = metricsData && metricsData.dayChange >= 0 ? COLORS.neon.green : COLORS.neon.red;
  const isInWatchlist = isTicker(ticker);

  return (
    <div className="py-12 pb-24 md:pb-12">
      {/* Header */}
      <div className="mb-12 flex items-start justify-between">
        <div className="flex-1">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <div className="flex items-baseline gap-3 mb-4">
            <h1 className="text-4xl font-bold text-white">
              {ticker}
            </h1>
            <p className="text-gray-400 text-lg">
              {metricsData?.price ? `$${metricsData.price.toFixed(2)}` : '—'}
            </p>
          </div>

          {metricsData && (
            <div className="flex items-center gap-4">
              <span style={{ color: dayChangeColor }} className="font-semibold">
                {metricsData.dayChange >= 0 ? '+' : ''}
                {metricsData.dayChange.toFixed(2)} ({metricsData.dayChangePct.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setChatOpen(true)}
            className="p-3 rounded-lg transition-colors"
            style={{
              backgroundColor: COLORS.dark.border,
              color: COLORS.gray[400],
            }}
            title="Ask AI about this stock"
          >
            <MessageSquare size={24} />
          </button>
          <button
            onClick={handleAddToWatchlist}
            className="p-3 rounded-lg transition-colors"
            style={{
              backgroundColor: isInWatchlist ? `${COLORS.brand.purple}20` : `${COLORS.dark.border}`,
              color: isInWatchlist ? COLORS.brand.purple : COLORS.gray[400],
            }}
          >
            <Star
              size={24}
              fill={isInWatchlist ? COLORS.brand.purple : 'none'}
            />
          </button>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-8">
        <PriceChart
          ticker={ticker}
          data={chartData}
          transactionMarkers={transactionMarkers}
          loading={chartLoading}
          error={chartError}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          onTimeframeHover={prefetchTimeframe}
        />
      </div>

      {/* Key Metrics */}
      <div className="mb-8">
        <StockMetrics data={metricsData || undefined} loading={metricsLoading} />
      </div>

      {/* User Position Panel */}
      {ownedShares > 0 && (
        <div className="mb-8">
          <Card title="Your Position">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Shares Owned</p>
                <p className="text-2xl font-bold text-white">
                  {ownedShares.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Average Cost</p>
                <p className="text-2xl font-bold text-white">
                  ${holding?.costBasis.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Current Value</p>
                <p className="text-2xl font-bold text-white">
                  ${holding?.currentValue.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Unrealized Gain/Loss</p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: holding && holding.unrealizedGain >= 0
                      ? COLORS.neon.green
                      : COLORS.neon.red,
                  }}
                >
                  ${holding?.unrealizedGain.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Return %</p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: holding && holding.unrealizedGainPct >= 0
                      ? COLORS.neon.green
                      : COLORS.neon.red,
                  }}
                >
                  {holding?.unrealizedGainPct.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Cost Basis</p>
                <p className="text-2xl font-bold text-white">
                  ${holding?.totalCost.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions
        ticker={ticker}
        ownedShares={ownedShares}
        onBuy={handleBuy}
        onSell={handleSell}
      />

      {/* Transaction Modal */}
      <Modal
        isOpen={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        title={`${transactionType} ${ticker}`}
      >
        <TransactionForm
          ticker={ticker}
          transactionType={transactionType}
          maxShares={transactionType === 'SELL' ? ownedShares : undefined}
          onSuccess={handleTransactionComplete}
          onCancel={() => setTransactionModalOpen(false)}
        />
      </Modal>

      {/* AI Chat Terminal */}
      <ChatTerminal
        ticker={ticker}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
