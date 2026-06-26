'use client';

import { useState, useMemo } from 'react';
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
import {
  ProtectedRoute,
  Layout,
  Card,
  Input,
  Button,
} from '@/components';
import { usePortfolio } from '@/hooks';
import { calculateCompoundGrowth, getCompoundingAccelerationYear, YearlySnapshot } from '@/utils/compound';
import { formatCurrency } from '@/utils/financial';
import { COLORS } from '@/config/design-tokens';
import { Sparkles } from 'lucide-react';

const PRESETS = {
  conservative: { rate: 7, years: 20, label: 'Conservative' },
  moderate: { rate: 10, years: 20, label: 'Moderate' },
  aggressive: { rate: 15, years: 15, label: 'Aggressive' },
  fire: { rate: 10, years: 30, label: 'FIRE Goal' },
};

const REFERENCE_RATES = [
  { rate: 7, label: 'S&P 500 (inflation-adjusted)' },
  { rate: 10, label: 'S&P 500 (nominal)' },
  { rate: 15, label: 'Aggressive growth' },
];

export default function CalculatorPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <CompoundCalculator />
      </Layout>
    </ProtectedRoute>
  );
}

function CompoundCalculator() {
  const { metrics } = usePortfolio();
  const netWorth = metrics?.netWorth || 0;
  const [usePortfolioValue, setUsePortfolioValue] = useState(netWorth > 0);
  const [customStartAmount, setCustomStartAmount] = useState('15000');
  const [annualContribution, setAnnualContribution] = useState('20000');
  const [annualRate, setAnnualRate] = useState(10);
  const [years, setYears] = useState(20);
  const [frequency, setFrequency] = useState<'annually' | 'quarterly' | 'monthly'>('annually');

  const startingAmount = usePortfolioValue ? netWorth : parseFloat(customStartAmount) || 0;

  const snapshots = useMemo(() => {
    return calculateCompoundGrowth({
      startingAmount,
      annualContribution: parseFloat(annualContribution) || 0,
      annualRate: annualRate / 100,
      years,
      frequency,
    });
  }, [startingAmount, annualContribution, annualRate, years, frequency]);

  const finalSnapshot = snapshots[snapshots.length - 1];
  const accelerationYear = useMemo(
    () => getCompoundingAccelerationYear(snapshots),
    [snapshots]
  );

  // Chart data with contributed + interest split
  const chartData = snapshots.map((snap) => ({
    year: snap.year,
    contributed: snap.totalContributed,
    earned: snap.totalInterest,
    total: snap.endBalance,
  }));

  const getRateLabel = () => {
    const closest = REFERENCE_RATES.reduce((prev, curr) =>
      Math.abs(curr.rate - annualRate) < Math.abs(prev.rate - annualRate)
        ? curr
        : prev
    );
    return closest.label;
  };

  const handlePreset = (preset: keyof typeof PRESETS) => {
    setAnnualRate(PRESETS[preset].rate);
    setYears(PRESETS[preset].years);
  };

  const handleCustomStartBlur = () => {
    if (!customStartAmount) setCustomStartAmount('0');
  };

  const handleContributionBlur = () => {
    if (!annualContribution) setAnnualContribution('0');
    else {
      const num = parseFloat(annualContribution);
      if (!isNaN(num)) {
        setAnnualContribution(Math.max(0, num).toString());
      }
    }
  };

  return (
    <div className="py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Growth Calculator</h1>
        <p className="text-gray-400">Project your portfolio growth with compound interest</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Summary Cards */}
        <Card className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Final Balance */}
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Final Balance</p>
              <p
                className="text-3xl md:text-4xl font-bold"
                style={{ color: COLORS.neon.green }}
              >
                {formatCurrency(finalSnapshot.endBalance)}
              </p>
            </div>

            {/* Total Contributed */}
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Total Contributed</p>
              <p className="text-3xl md:text-4xl font-bold text-white">
                {formatCurrency(finalSnapshot.totalContributed)}
              </p>
            </div>

            {/* Total Interest Earned - THE HERO */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400">Total Interest Earned</p>
                <Sparkles
                  size={16}
                  style={{ color: COLORS.brand.purple }}
                  fill={COLORS.brand.purple}
                />
              </div>
              <p
                className="text-3xl md:text-4xl font-bold"
                style={{ color: COLORS.brand.purple }}
              >
                {formatCurrency(finalSnapshot.totalInterest)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {((finalSnapshot.totalInterest / finalSnapshot.totalContributed) * 100).toFixed(0)}%
                {' '}
                of contributions
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Layout: Inputs (left) + Chart (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Panel — Inputs */}
        <div className="space-y-6">
          {/* Starting Amount */}
          <Card title="Starting Amount">
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={usePortfolioValue}
                    onChange={() => setUsePortfolioValue(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">Use my portfolio</span>
                </label>

                {usePortfolioValue && netWorth > 0 && (
                  <div className="ml-7 p-3 bg-dark-panel border border-dark-border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: COLORS.neon.green }}
                      />
                      <span className="text-sm text-gray-400">Current Portfolio Value</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(netWorth)}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={!usePortfolioValue}
                    onChange={() => setUsePortfolioValue(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">Custom amount</span>
                </label>

                {!usePortfolioValue && (
                  <div className="ml-7">
                    <Input
                      type="text"
                      value={customStartAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setCustomStartAmount(val);
                      }}
                      onBlur={handleCustomStartBlur}
                      placeholder="0"
                      className="pl-6"
                    />
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400">
                      $
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Annual Contribution */}
          <Card title="Annual Contribution">
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Additional amount per year</p>
              <div className="relative">
                <Input
                  type="text"
                  value={annualContribution}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setAnnualContribution(val);
                  }}
                  onBlur={handleContributionBlur}
                  placeholder="0"
                  className="pl-6"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              </div>
            </div>
          </Card>

          {/* Annual Growth Rate */}
          <Card title="Expected Annual Return">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-400">Growth Rate</span>
                <span className="text-2xl font-bold text-brand-purple">{annualRate.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={annualRate}
                onChange={(e) => setAnnualRate(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">{getRateLabel()}</p>
            </div>
          </Card>

          {/* Time Horizon */}
          <Card title="Investment Period">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-400">Duration</span>
                <span className="text-2xl font-bold text-brand-purple">{years} years</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Until: {new Date().getFullYear() + years}</p>
            </div>
          </Card>

          {/* Compound Frequency */}
          <Card title="Compound Frequency">
            <select
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as 'annually' | 'quarterly' | 'monthly')
              }
              className="w-full bg-dark-panel border border-dark-border rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            >
              <option value="annually">Annually</option>
              <option value="quarterly">Quarterly</option>
              <option value="monthly">Monthly</option>
            </select>
          </Card>

          {/* Preset Buttons */}
          <Card title="Quick Presets">
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(PRESETS) as [keyof typeof PRESETS, (typeof PRESETS)[keyof typeof PRESETS]][]).map(
                ([key, preset]) => (
                  <Button
                    key={key}
                    onClick={() => handlePreset(key)}
                    variant={
                      annualRate === preset.rate && years === preset.years
                        ? 'primary'
                        : 'secondary'
                    }
                    size="sm"
                  >
                    {preset.label}
                  </Button>
                )
              )}
            </div>
          </Card>
        </div>

        {/* Right Panel — Chart */}
        <div className="space-y-6">
          <Card title="Growth Projection" noPadding>
            <div className="p-6">
              <div className="h-64 md:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="contributedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.gray[500]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.gray[500]} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="earnedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.brand.purple} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.brand.purple} stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={COLORS.dark.border}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="year"
                      stroke={COLORS.gray[400]}
                      tick={{ fontSize: 12, fill: COLORS.gray[400] }}
                      tickLine={false}
                    />

                    <YAxis
                      stroke={COLORS.gray[400]}
                      tick={{ fontSize: 12, fill: COLORS.gray[400] }}
                      tickLine={false}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                        return `$${value}`;
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: COLORS.dark.panel,
                        border: `1px solid ${COLORS.dark.border}`,
                        borderRadius: '8px',
                      }}
                      formatter={(value) => formatCurrency(value as number)}
                      labelFormatter={(label) => `Year ${label}`}
                    />

                    <Area
                      type="monotone"
                      dataKey="contributed"
                      stackId="1"
                      stroke={COLORS.gray[500]}
                      strokeWidth={1}
                      fill="url(#contributedGradient)"
                      name="Amount Contributed"
                    />

                    <Area
                      type="monotone"
                      dataKey="earned"
                      stackId="1"
                      stroke={COLORS.brand.purple}
                      strokeWidth={2}
                      fill="url(#earnedGradient)"
                      name="Interest Earned"
                    />

                    {accelerationYear !== null && accelerationYear > 0 && (
                      <ReferenceDot
                        x={accelerationYear}
                        y={chartData[accelerationYear]?.total || 0}
                        r={4}
                        fill={COLORS.neon.green}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {accelerationYear !== null && accelerationYear > 0 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  ↑ Year {accelerationYear}: Interest earned exceeds annual contributions
                </p>
              )}

              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.gray[500] }}
                  />
                  <span>Amount Contributed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.brand.purple }}
                  />
                  <span>Interest Earned</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Year-by-Year Breakdown */}
      <BreakdownTable snapshots={snapshots} />
    </div>
  );
}

function BreakdownTable({ snapshots }: { snapshots: YearlySnapshot[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <div className="space-y-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-brand-purple hover:text-brand-purple/80 transition-colors"
        >
          {expanded ? '▼' : '▶'} Show full breakdown ({snapshots.length - 1} years)
        </button>

        {expanded && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border bg-dark-surface/50">
                  <th className="px-4 py-3 text-left text-gray-400 font-medium">Year</th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">
                    Starting Balance
                  </th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">
                    Annual Contribution
                  </th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">
                    Interest Earned
                  </th>
                  <th className="px-4 py-3 text-right text-gray-400 font-medium">
                    Ending Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snap, idx) => (
                  <tr
                    key={snap.year}
                    className={`border-b border-dark-border transition-colors ${
                      idx % 2 === 0 ? 'bg-dark-panel/20' : ''
                    } ${snap.year === snapshots.length - 1 ? 'font-bold bg-dark-panel/40' : ''}`}
                  >
                    <td className="px-4 py-3 text-gray-300">{snap.year}</td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatCurrency(snap.startBalance)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatCurrency(snap.contribution)}
                    </td>
                    <td className="px-4 py-3 text-right text-brand-purple">
                      {formatCurrency(snap.interestEarned)}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(snap.endBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
