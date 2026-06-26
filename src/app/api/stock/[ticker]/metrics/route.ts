import { NextRequest, NextResponse } from 'next/server';

export interface StockMetrics {
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

// Mock data for known tickers
const MOCK_METRICS: Record<string, Omit<StockMetrics, 'ticker'>> = {
  AAPL: {
    price: 195.45,
    dayChange: 2.15,
    dayChangePct: 1.11,
    high52w: 199.62,
    low52w: 164.08,
    volume: 52800000,
    marketCap: 3.04e12,
    pe: 28.5,
    beta: 1.24,
    eps: 6.85,
    dividendYield: 0.44,
    sharesOutstanding: 15.6e9,
  },
  MSFT: {
    price: 430.12,
    dayChange: 3.45,
    dayChangePct: 0.81,
    high52w: 468.85,
    low52w: 310.49,
    volume: 18600000,
    marketCap: 3.21e12,
    pe: 35.2,
    beta: 0.92,
    eps: 12.22,
    dividendYield: 0.72,
    sharesOutstanding: 7.46e9,
  },
  GOOGL: {
    price: 142.80,
    dayChange: 1.23,
    dayChangePct: 0.87,
    high52w: 152.46,
    low52w: 102.21,
    volume: 28300000,
    marketCap: 1.42e12,
    pe: 24.3,
    beta: 1.05,
    eps: 5.87,
    dividendYield: 0,
    sharesOutstanding: 9.96e9,
  },
  TSLA: {
    price: 245.67,
    dayChange: -3.21,
    dayChangePct: -1.29,
    high52w: 299.29,
    low52w: 138.80,
    volume: 142300000,
    marketCap: 778e9,
    pe: 68.4,
    beta: 2.31,
    eps: 3.59,
    dividendYield: 0,
    sharesOutstanding: 3.17e9,
  },
  NVDA: {
    price: 875.30,
    dayChange: 12.45,
    dayChangePct: 1.44,
    high52w: 974.25,
    low52w: 308.70,
    volume: 38900000,
    marketCap: 2.15e12,
    pe: 59.2,
    beta: 1.85,
    eps: 14.78,
    dividendYield: 0.04,
    sharesOutstanding: 2.46e9,
  },
  META: {
    price: 502.13,
    dayChange: -1.87,
    dayChangePct: -0.37,
    high52w: 558.69,
    low52w: 163.08,
    volume: 24100000,
    marketCap: 1.28e12,
    pe: 22.8,
    beta: 1.22,
    eps: 22.01,
    dividendYield: 0,
    sharesOutstanding: 2.55e9,
  },
  AMZN: {
    price: 198.50,
    dayChange: 2.88,
    dayChangePct: 1.47,
    high52w: 201.20,
    low52w: 101.26,
    volume: 51200000,
    marketCap: 2.06e12,
    pe: 52.1,
    beta: 1.08,
    eps: 3.81,
    dividendYield: 0,
    sharesOutstanding: 10.4e9,
  },
  NFLX: {
    price: 247.89,
    dayChange: 1.56,
    dayChangePct: 0.63,
    high52w: 316.34,
    low52w: 162.71,
    volume: 2800000,
    marketCap: 107e9,
    pe: 41.2,
    beta: 1.13,
    eps: 6.01,
    dividendYield: 0,
    sharesOutstanding: 432e6,
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase();

  if (!/^[A-Z]{1,5}$/.test(ticker)) {
    return NextResponse.json(
      { error: 'Invalid ticker' },
      { status: 400 }
    );
  }

  // Check if we have mock data for this ticker
  const mockData = MOCK_METRICS[ticker];

  if (!mockData) {
    // Generate plausible mock data for unknown tickers
    const basePrice = 100 + (ticker.charCodeAt(0) % 300);
    const volatility = 0.3 + (ticker.charCodeAt(1) % 5) * 0.1;
    const dayChange = (Math.random() - 0.5) * basePrice * volatility;

    const metrics: StockMetrics = {
      ticker,
      price: basePrice,
      dayChange,
      dayChangePct: (dayChange / basePrice) * 100,
      high52w: basePrice * (1.2 + Math.random() * 0.3),
      low52w: basePrice * (0.6 + Math.random() * 0.2),
      volume: Math.floor(10e6 + Math.random() * 100e6),
      marketCap: basePrice * (1e9 + Math.random() * 3e9),
      pe: 15 + Math.random() * 40,
      beta: 0.8 + Math.random() * 1.2,
      eps: basePrice * (Math.random() * 0.1),
      dividendYield: Math.random() * 0.03,
      sharesOutstanding: 1e9 + Math.random() * 5e9,
    };
    return NextResponse.json(metrics, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  }

  const metrics: StockMetrics = {
    ticker,
    ...mockData,
  };

  return NextResponse.json(metrics, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}
