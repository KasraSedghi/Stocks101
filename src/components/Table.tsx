'use client';

import { useState, ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
}

interface TableProps<T extends Record<string, any>> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: string;
  rowKey?: keyof T;
}

type SortDirection = 'asc' | 'desc' | null;

export function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyState = 'No data available',
  rowKey,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data];
  if (sortKey && sortDirection) {
    sortedData.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  if (loading) {
    return (
      <div className="overflow-x-auto border border-dark-border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-300"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-dark-border">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-6 py-3">
                    <Skeleton variant="line" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border border-dark-border rounded-lg px-6 py-12 text-center">
        <p className="text-gray-400">{emptyState}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-dark-border rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border bg-dark-panel">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-6 py-3 text-left text-sm font-semibold text-gray-300',
                  col.sortable && 'cursor-pointer hover:text-white transition-colors'
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-2">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <>
                      {sortDirection === 'asc' ? (
                        <ChevronUp size={16} className="text-brand-purple" />
                      ) : (
                        <ChevronDown size={16} className="text-brand-purple" />
                      )}
                    </>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr
              key={rowKey ? String(row[rowKey]) : idx}
              className={cn(
                'border-b border-dark-border hover:bg-dark-surface transition-colors',
                idx % 2 === 0 && 'bg-dark-panel/30'
              )}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-6 py-3 text-sm text-white">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
