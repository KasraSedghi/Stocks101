'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks';
import { ProtectedRoute, Layout, KPIBadge, HoldingsList, AllocationChart, RecentTransactions } from '@/components';
import { formatCurrency, formatPercent } from '@/utils/financial';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Lock,
  BarChart3,
  CreditCard,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { metrics, holdings, transactions, loading } = usePortfolio();

  const netWorth = metrics?.netWorth || 0;
  const unrealizedGain = metrics?.unrealizedGain || 0;
  const realizedGain = metrics?.realizedGain || 0;
  const totalInvested = metrics?.totalInvested || 0;
  const totalValue = metrics?.totalValue || 0;
  const portfolioReturn = totalInvested > 0
    ? ((netWorth - totalInvested) / totalInvested) * 100
    : 0;

  return (
    <div className="py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.email?.split('@')[0]}
        </h1>
        <p className="text-gray-400">
          Your portfolio performance at a glance
        </p>
      </div>

      {/* KPI Badges - 3 cols desktop, 2 cols tablet, 1 col mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <KPIBadge
          label="Net Worth"
          value={formatCurrency(netWorth)}
          icon={<Wallet size={24} />}
          color="neutral"
        />
        <KPIBadge
          label="Unrealized Gain/Loss"
          value={formatCurrency(unrealizedGain)}
          subValue={formatPercent(
            totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0
          )}
          icon={unrealizedGain >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          color={unrealizedGain >= 0 ? 'positive' : 'negative'}
        />
        <KPIBadge
          label="Realized Gain/Loss"
          value={formatCurrency(realizedGain)}
          icon={<Lock size={24} />}
          color={realizedGain >= 0 ? 'positive' : 'negative'}
        />
        <KPIBadge
          label="Portfolio Return"
          value={formatPercent(portfolioReturn, false)}
          icon={<BarChart3 size={24} />}
          color={portfolioReturn >= 0 ? 'positive' : 'negative'}
        />
        <KPIBadge
          label="Total Invested"
          value={formatCurrency(totalInvested)}
          icon={<CreditCard size={24} />}
          color="neutral"
        />
        {totalInvested > 0 && (
          <KPIBadge
            label="Current Value"
            value={formatCurrency(totalValue)}
            subValue={`${((totalValue - totalInvested) / totalInvested * 100).toFixed(2)}% change`}
            icon={<TrendingUp size={24} />}
            color={totalValue >= totalInvested ? 'positive' : 'negative'}
          />
        )}
      </div>

      {/* Main Content Grid - Holdings, Allocation, Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table - spans 2 cols on desktop */}
        <div className="lg:col-span-2">
          <HoldingsList
            holdings={holdings}
            totalValue={totalValue}
            loading={loading}
          />
        </div>

        {/* Allocation Chart */}
        <div className="lg:col-span-1">
          <AllocationChart holdings={holdings} totalValue={totalValue} />
        </div>
      </div>

      {/* Recent Transactions - full width */}
      <div className="mt-6">
        <RecentTransactions transactions={transactions} loading={loading} />
      </div>
    </div>
  );
}
