'use client';

import { formatCurrency, formatPercent } from '@/utils/financial';
import { COLORS } from '@/config/design-tokens';
import { Card } from './Card';
import { Skeleton } from './Skeleton';

export interface StockMetricsData {
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

export interface StockMetricsProps {
  data?: StockMetricsData;
  loading?: boolean;
}

interface MetricItem {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

export function StockMetrics({ data, loading }: StockMetricsProps) {
  if (loading) {
    return (
      <Card title="Key Metrics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i}>
              <Skeleton variant="line" className="w-20 h-4 mb-2" />
              <Skeleton variant="line" className="w-24 h-6" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card title="Key Metrics">
        <div className="text-center text-gray-500 py-8">
          No metrics available
        </div>
      </Card>
    );
  }

  const metrics: MetricItem[] = [
    {
      label: 'Current Price',
      value: formatCurrency(data.price),
    },
    {
      label: 'Day Change',
      value: formatCurrency(data.dayChange),
      subValue: formatPercent(data.dayChangePct, false),
      color: data.dayChange >= 0 ? COLORS.neon.green : COLORS.neon.red,
    },
    {
      label: 'Day Range',
      value: `${formatCurrency(data.low52w)} - ${formatCurrency(data.high52w)}`,
    },
    {
      label: '52-Week High',
      value: formatCurrency(data.high52w),
    },
    {
      label: '52-Week Low',
      value: formatCurrency(data.low52w),
    },
    {
      label: 'Volume',
      value: (data.volume / 1e6).toFixed(1) + 'M',
    },
    {
      label: 'Market Cap',
      value: data.marketCap >= 1e12
        ? `$${(data.marketCap / 1e12).toFixed(2)}T`
        : data.marketCap >= 1e9
        ? `$${(data.marketCap / 1e9).toFixed(2)}B`
        : formatCurrency(data.marketCap),
    },
    {
      label: 'P/E Ratio',
      value: data.pe >= 0 ? data.pe.toFixed(2) : '—',
    },
    {
      label: 'Beta',
      value: data.beta.toFixed(2),
    },
    {
      label: 'Dividend Yield',
      value: data.dividendYield > 0 ? formatPercent(data.dividendYield * 100, false) : '—',
    },
    {
      label: 'EPS',
      value: data.eps > 0 ? formatCurrency(data.eps) : '—',
    },
    {
      label: 'Shares Outstanding',
      value: data.sharesOutstanding >= 1e9
        ? `${(data.sharesOutstanding / 1e9).toFixed(2)}B`
        : `${(data.sharesOutstanding / 1e6).toFixed(2)}M`,
    },
  ];

  return (
    <Card title="Key Metrics">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="border-l-2 border-dark-border pl-4">
            <p className="text-sm text-gray-400 mb-1">{metric.label}</p>
            <div>
              <p
                className="text-lg font-bold"
                style={{ color: metric.color || 'white' }}
              >
                {metric.value}
              </p>
              {metric.subValue && (
                <p
                  className="text-xs mt-1"
                  style={{ color: metric.color || COLORS.gray[400] }}
                >
                  {metric.subValue}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
