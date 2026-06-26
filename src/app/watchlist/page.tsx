'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useToast } from '@/hooks';
import {
  ProtectedRoute,
  Layout,
  Card,
  Button,
  Input,
  Modal,
  Skeleton,
} from '@/components';
import { formatCurrency, formatPercent } from '@/utils/financial';
import { COLORS } from '@/config/design-tokens';
import { Trash2, Plus } from 'lucide-react';

type SortKey = 'ticker' | 'price' | 'change' | 'changePct';
type SortDirection = 'asc' | 'desc' | null;

export default function WatchlistPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Watchlist />
      </Layout>
    </ProtectedRoute>
  );
}

function Watchlist() {
  const router = useRouter();
  const { watchlist, prices, loading, pricesLoading, addTicker, removeTicker } =
    useWatchlist();
  const { success, error: errorToast } = useToast();

  const [newTicker, setNewTicker] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('ticker');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();

    const ticker = newTicker.trim().toUpperCase();
    if (!ticker) {
      errorToast('Please enter a ticker');
      return;
    }

    if (!/^[A-Z]{1,5}$/.test(ticker)) {
      errorToast('Invalid ticker format');
      return;
    }

    if (watchlist.includes(ticker)) {
      errorToast('Already in watchlist');
      return;
    }

    try {
      await addTicker(ticker);
      success(`${ticker} added to watchlist`);
      setNewTicker('');
    } catch (err) {
      errorToast('Failed to add ticker');
    }
  };

  const handleDelete = (ticker: string) => {
    setDeleteTarget(ticker);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await removeTicker(deleteTarget);
      success(`${deleteTarget} removed from watchlist`);
      setDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      errorToast('Failed to remove ticker');
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(
        sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc'
      );
      if (sortDirection === null) {
        setSortKey('ticker');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortedWatchlist = () => {
    let sorted = [...watchlist];

    if (sortKey && sortDirection) {
      sorted.sort((a, b) => {
        const priceA = prices[a];
        const priceB = prices[b];

        let valA: any = 0;
        let valB: any = 0;

        switch (sortKey) {
          case 'ticker':
            valA = a;
            valB = b;
            break;
          case 'price':
            valA = priceA?.price || 0;
            valB = priceB?.price || 0;
            break;
          case 'change':
            valA = priceA?.change || 0;
            valB = priceB?.change || 0;
            break;
          case 'changePct':
            valA = priceA?.changePct || 0;
            valB = priceB?.changePct || 0;
            break;
        }

        if (sortKey === 'ticker') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }

    return sorted;
  };

  const renderSortIndicator = (key: SortKey) => {
    if (sortKey !== key) return ' ⋮';
    if (sortDirection === 'asc') return ' ↑';
    if (sortDirection === 'desc') return ' ↓';
    return ' ⋮';
  };

  if (loading) {
    return (
      <div className="py-12">
        <h1 className="text-3xl font-bold mb-8 text-white">Watchlist</h1>
        <Card title="Loading...">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="line" className="h-12" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const sortedWatchlist = getSortedWatchlist();

  return (
    <div className="py-12 pb-24 md:pb-12">
      <h1 className="text-3xl font-bold mb-8 text-white">Watchlist</h1>

      {/* Add Ticker Form */}
      <Card title="Add Stock" className="mb-8">
        <form onSubmit={handleAddTicker} className="flex gap-3">
          <Input
            type="text"
            placeholder="Enter ticker (e.g., AAPL)"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newTicker.trim()}
            leftIcon={<Plus size={18} />}
          >
            Add
          </Button>
        </form>
      </Card>

      {/* Watchlist Table */}
      {watchlist.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Your watchlist is empty</p>
            <p className="text-sm text-gray-500">
              Search for a stock to add it to your watchlist
            </p>
          </div>
        </Card>
      ) : (
        <Card title={`Watchlist (${watchlist.length})`}>
          {pricesLoading && watchlist.length > 0 && (
            <div className="mb-4 text-sm text-gray-400">
              Updating prices...
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    <button
                      onClick={() => handleSort('ticker')}
                      className="hover:text-white transition-colors"
                    >
                      Ticker
                      {renderSortIndicator('ticker')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Company Name
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">
                    <button
                      onClick={() => handleSort('price')}
                      className="hover:text-white transition-colors float-right"
                    >
                      Price
                      {renderSortIndicator('price')}
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">
                    <button
                      onClick={() => handleSort('change')}
                      className="hover:text-white transition-colors float-right"
                    >
                      Change ($)
                      {renderSortIndicator('change')}
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">
                    <button
                      onClick={() => handleSort('changePct')}
                      className="hover:text-white transition-colors float-right"
                    >
                      Change (%)
                      {renderSortIndicator('changePct')}
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedWatchlist.map((ticker, idx) => {
                  const priceData = prices[ticker];
                  const changeColor =
                    priceData && priceData.change >= 0
                      ? COLORS.neon.green
                      : COLORS.neon.red;

                  return (
                    <tr
                      key={ticker}
                      className={`border-b border-dark-border hover:bg-dark-panel/50 transition-colors ${
                        idx % 2 === 0 ? 'bg-dark-panel/20' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <button
                          onClick={() => router.push(`/stock/${ticker}`)}
                          className="text-brand-purple hover:text-brand-purple/80 font-semibold transition-colors"
                        >
                          {ticker}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {priceData?.companyName || '—'}
                      </td>
                      <td className="py-4 px-4 text-right text-white">
                        {priceData ? formatCurrency(priceData.price) : '—'}
                      </td>
                      <td
                        className="py-4 px-4 text-right font-semibold"
                        style={{ color: changeColor }}
                      >
                        {priceData
                          ? `${priceData.change >= 0 ? '+' : ''}${formatCurrency(priceData.change)}`
                          : '—'}
                      </td>
                      <td
                        className="py-4 px-4 text-right font-semibold"
                        style={{ color: changeColor }}
                      >
                        {priceData
                          ? `${priceData.changePct >= 0 ? '+' : ''}${formatPercent(priceData.changePct, false)}`
                          : '—'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDelete(ticker)}
                          className="p-2 hover:bg-dark-border rounded-lg transition-colors text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Remove from Watchlist"
      >
        <div className="space-y-6">
          <p className="text-gray-300">
            Are you sure you want to remove{' '}
            <span className="font-semibold text-white">{deleteTarget}</span>{' '}
            from your watchlist?
          </p>
          <div className="flex gap-3">
            <Button
              onClick={confirmDelete}
              variant="danger"
              className="flex-1"
            >
              Remove
            </Button>
            <Button
              onClick={() => setDeleteModalOpen(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
