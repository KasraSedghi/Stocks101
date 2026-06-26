'use client';

import { useMemo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { Transaction } from '@/utils/financial';
import { Timeframe, ChartData } from '@/hooks/usePriceChart';
import { COLORS } from '@/config/design-tokens';
import { formatCurrency } from '@/utils/financial';
import { Card } from './Card';
import { Skeleton } from './Skeleton';
import { TimeframeToggle } from './TimeframeToggle';

export interface PriceChartProps {
  ticker: string;
  data: ChartData[];
  transactionMarkers: Transaction[];
  loading?: boolean;
  error?: string | null;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  onTimeframeHover?: (timeframe: Timeframe) => void;
}

export function PriceChart({
  ticker,
  data,
  transactionMarkers,
  loading,
  error,
  timeframe,
  onTimeframeChange,
  onTimeframeHover,
}: PriceChartProps) {
  const chartColor = useMemo(() => {
    if (data.length < 2) return COLORS.neon.green;
    const startPrice = data[0]!.price;
    const endPrice = data[data.length - 1]!.price;
    return endPrice >= startPrice ? COLORS.neon.green : COLORS.neon.red;
  }, [data]);

  const CustomTooltip = useCallback(
    ({ active, payload }: any) => {
      if (active && payload && payload[0]) {
        const { date, price } = payload[0].payload;
        return (
          <div className="bg-dark-panel border border-dark-border rounded-lg p-3">
            <p className="text-sm text-gray-400">{date}</p>
            <p className="font-bold text-white text-lg">
              {formatCurrency(price)}
            </p>
          </div>
        );
      }
      return null;
    },
    []
  );

  const XAxisTick = useCallback(
    ({ x, y, payload }: any) => {
      let label = payload.value;

      // Format date label based on timeframe
      if (['1D', '5D'].includes(timeframe)) {
        // Show time for short timeframes
        try {
          const date = new Date(`${payload.value}T00:00:00Z`);
          label = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        } catch {
          // Fallback if date parsing fails
        }
      } else {
        // Show date for longer timeframes
        try {
          const date = new Date(`${payload.value}T00:00:00Z`);
          label = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
        } catch {
          // Fallback if date parsing fails
        }
      }

      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            dy={4}
            textAnchor="middle"
            fill={COLORS.gray[400]}
            fontSize={12}
          >
            {label}
          </text>
        </g>
      );
    },
    [timeframe]
  );

  if (loading) {
    return (
      <Card title={`${ticker} Price Chart`}>
        <div className="flex flex-col gap-4">
          <TimeframeToggle
            activeTimeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            onHover={onTimeframeHover}
          />
          <Skeleton variant="chart" className="w-full h-64" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={`${ticker} Price Chart`}>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Unable to load chart data
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card title={`${ticker} Price Chart`}>
        <div className="flex flex-col gap-4">
          <TimeframeToggle
            activeTimeframe={timeframe}
            onTimeframeChange={onTimeframeChange}
            onHover={onTimeframeHover}
          />
          <div className="flex items-center justify-center h-64 text-gray-500">
            No price data available
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`${ticker} Price Chart`}>
      <div className="flex flex-col gap-6">
        <TimeframeToggle
          activeTimeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
          onHover={onTimeframeHover}
        />

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLORS.dark.border}
              vertical={false}
            />

            <XAxis
              dataKey="date"
              stroke={COLORS.gray[400]}
              tick={<XAxisTick />}
              tickLine={false}
              interval={Math.max(0, Math.floor(data.length / 6))}
            />

            <YAxis
              stroke={COLORS.gray[400]}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              tick={{ fontSize: 12, fill: COLORS.gray[400] }}
              tickLine={false}
              domain={['dataMin', 'dataMax']}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />

            {/* Transaction markers */}
            {transactionMarkers.map((marker, idx) => {
              const dataPoint = data.find(
                (d) => d.date === new Date(marker.transaction_date).toISOString().split('T')[0]
              );
              if (!dataPoint) return null;

              const isBuy = marker.transaction_type === 'BUY';
              const markerColor = isBuy ? COLORS.brand.purple : COLORS.neon.green;

              return (
                <ReferenceDot
                  key={`${marker.id}-${idx}`}
                  x={dataPoint.date}
                  y={dataPoint.price}
                  r={4}
                  fill={markerColor}
                  stroke={markerColor}
                  strokeWidth={1}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>

        {transactionMarkers.length > 0 && (
          <div className="text-xs text-gray-500 text-center">
            ▼ BUY • ▲ SELL ({transactionMarkers.length} transactions)
          </div>
        )}
      </div>
    </Card>
  );
}
