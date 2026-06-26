'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute, Button, Card, Input, Modal } from '@/components';
import { Layout } from '@/components';
import { usePortfolio } from '@/hooks';
import { useToast } from '@/hooks';
import { formatCurrency } from '@/utils/financial';
import { COLORS } from '@/config/design-tokens';
import { Trash2 } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <TransactionHistory />
      </Layout>
    </ProtectedRoute>
  );
}

function TransactionHistory() {
  const { transactions, deleteTransaction } = usePortfolio();
  const { success, error: errorToast } = useToast();

  const [filterTicker, setFilterTicker] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [sortField, setSortField] = useState<'date' | 'ticker' | 'type'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const itemsPerPage = 20;

  // Filter and sort
  const filtered = useMemo(() => {
    let result = [...transactions];

    if (filterTicker) {
      result = result.filter((t) =>
        t.ticker.toUpperCase().includes(filterTicker.toUpperCase())
      );
    }

    if (filterType !== 'ALL') {
      result = result.filter((t) => t.transaction_type === filterType);
    }

    // Sort
    result.sort((a, b) => {
      let compareVal = 0;

      if (sortField === 'date') {
        compareVal =
          new Date(a.transaction_date).getTime() -
          new Date(b.transaction_date).getTime();
      } else if (sortField === 'ticker') {
        compareVal = a.ticker.localeCompare(b.ticker);
      } else if (sortField === 'type') {
        compareVal = a.transaction_type.localeCompare(b.transaction_type);
      }

      return sortDir === 'asc' ? compareVal : -compareVal;
    });

    return result;
  }, [transactions, filterTicker, filterType, sortField, sortDir]);

  const total = filtered.length;
  const pages = Math.ceil(total / itemsPerPage);
  const paged = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleSort = (field: 'date' | 'ticker' | 'type') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await deleteTransaction(id);
      success('Transaction deleted');
      setDeleteConfirm(null);
    } catch (err) {
      errorToast(
        err instanceof Error ? err.message : 'Failed to delete'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Transactions</h1>
        <p className="text-gray-400 mb-6">
          {total} transaction{total !== 1 ? 's' : ''}
        </p>

        <Button
          onClick={() =>
            window.location.href = '/transactions/add'
          }
        >
          Add Transaction
        </Button>
      </div>

      <Card noPadding>
        {/* Filters */}
        <div className="p-6 border-b border-dark-border flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-2 block">Ticker</label>
            <Input
              type="text"
              value={filterTicker}
              onChange={(e) => {
                setFilterTicker(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by ticker..."
            />
          </div>

          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-2 block">Type</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as 'ALL' | 'BUY' | 'SELL');
                setPage(1);
              }}
              className="w-full bg-dark-panel border border-dark-border rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            >
              <option value="ALL">All</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border bg-dark-surface/50">
                <th className="px-6 py-4 text-left text-gray-400 font-medium cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (
                    <span className="ml-1">
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-6 py-4 text-left text-gray-400 font-medium cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('ticker')}>
                  Ticker {sortField === 'ticker' && (
                    <span className="ml-1">
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-6 py-4 text-left text-gray-400 font-medium cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('type')}>
                  Type {sortField === 'type' && (
                    <span className="ml-1">
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-6 py-4 text-right text-gray-400 font-medium">
                  Shares
                </th>
                <th className="px-6 py-4 text-right text-gray-400 font-medium">
                  Price
                </th>
                <th className="px-6 py-4 text-right text-gray-400 font-medium">
                  Total
                </th>
                <th className="px-6 py-4 text-center text-gray-400 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No transactions yet
                  </td>
                </tr>
              ) : (
                paged.map((txn) => {
                  const total = txn.shares * txn.price_per_share;

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
                            backgroundColor:
                              txn.transaction_type === 'BUY'
                                ? `${COLORS.neon.green}20`
                                : `${COLORS.neon.red}20`,
                            color:
                              txn.transaction_type === 'BUY'
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
                      <td className="px-6 py-4 text-right text-gray-300">
                        {formatCurrency(txn.price_per_share)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-white">
                        {formatCurrency(total)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setDeleteConfirm(txn.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-dark-border flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Page {page} of {pages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="secondary"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page === pages}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Transaction"
      >
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteConfirm(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            loading={deleting}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
