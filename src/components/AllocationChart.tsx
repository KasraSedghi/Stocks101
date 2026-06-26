'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Holding } from '@/utils/financial';
import { Card } from './Card';
import { formatCurrency } from '@/utils/financial';

export interface AllocationChartProps {
  holdings: Holding[];
  totalValue: number;
}

export function AllocationChart({ holdings, totalValue }: AllocationChartProps) {
  const data = useMemo(() => {
    if (totalValue === 0) return [];
    return holdings.map((h) => ({
      name: h.ticker,
      value: parseFloat((h.currentValue / totalValue * 100).toFixed(2)),
      price: h.currentValue,
    }));
  }, [holdings, totalValue]);

  // Color palette: purple shades then green shades
  const colors = [
    '#8B5CF6', // brand.purple
    '#A78BFA', // lighter purple
    '#DDD6FE', // even lighter purple
    '#10B981', // neon.green
    '#34D399', // lighter green
  ];

  const colorMap = (index: number) => colors[index % colors.length];

  const renderCustomTooltip = (props: any) => {
    if (props.active && props.payload && props.payload[0]) {
      const { name, value, payload } = props.payload[0];
      return (
        <div className="bg-dark-panel border border-dark-border rounded-lg p-3">
          <p className="font-bold text-white">{name}</p>
          <p className="text-sm text-gray-400">
            {value.toFixed(2)}% • {formatCurrency(payload.price)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Portfolio Allocation">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No holdings to display
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colorMap(index)} />
              ))}
            </Pie>
            <Tooltip content={renderCustomTooltip} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
