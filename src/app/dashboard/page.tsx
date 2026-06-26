'use client';

import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components';
import { Layout } from '@/components';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="py-12">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.email}
        </h1>
        <p className="text-gray-400 mb-12">
          Here's your portfolio overview. More features coming soon.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Placeholder cards for portfolio metrics */}
          {[
            { label: 'Total Portfolio Value', value: '$0.00' },
            { label: 'Total Gains/Losses', value: '$0.00' },
            { label: 'Return %', value: '0.00%' },
          ].map((metric) => (
            <div
              key={metric.label}
              className="bg-dark-panel border border-dark-border rounded-lg p-6 hover:shadow-glow transition-shadow duration-normal"
            >
              <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
