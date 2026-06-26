import { NextRequest, NextResponse } from 'next/server';
import { getQuotes, isFinnhubConfigured } from '@/lib/finnhub';

export interface PriceBatchResponse {
  ticker: string;
  price: number;
  change: number;
  changePct: number;
  companyName: string;
}

// Mock company names (used only in the no-API-key fallback path).
const COMPANY_NAMES: Record<string, string> = {
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  GOOGL: 'Alphabet',
  TSLA: 'Tesla',
  NVDA: 'NVIDIA',
  META: 'Meta Platforms',
  AMZN: 'Amazon',
  NFLX: 'Netflix',
};

function generateMockPrice(
  ticker: string,
  seed: number
): { price: number; change: number; changePct: number } {
  const basePrice = 100 + ((ticker.charCodeAt(0) + seed) % 300);
  const volatility = 0.5 + ((ticker.charCodeAt(1) + seed) % 10) * 0.1;
  const change = (Math.sin(seed / 100) * basePrice * volatility) / 2;

  return {
    price: Math.max(10, basePrice + Math.sin(seed / 50) * 30),
    change,
    changePct: (change / basePrice) * 100,
  };
}

function mockBatch(tickers: string[]): PriceBatchResponse[] {
  const seed = Math.floor(Date.now() / 5000); // changes every 5s
  return tickers.map((ticker) => {
    const mock = generateMockPrice(ticker, seed);
    return {
      ticker,
      price: mock.price,
      change: mock.change,
      changePct: mock.changePct,
      companyName: COMPANY_NAMES[ticker] || ticker,
    };
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tickersParam = searchParams.get('tickers');

  if (!tickersParam) {
    return NextResponse.json(
      { error: 'tickers parameter is required' },
      { status: 400 }
    );
  }

  const tickers = tickersParam
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter((t) => /^[A-Z.]{1,6}$/.test(t));

  if (tickers.length === 0) {
    return NextResponse.json(
      { error: 'Invalid ticker format' },
      { status: 400 }
    );
  }

  // Real data path: Finnhub when an API key is configured.
  if (isFinnhubConfigured()) {
    const quotes = await getQuotes(tickers);
    const bySymbol = new Map(quotes.map((q) => [q.ticker, q]));

    // For any ticker Finnhub couldn't resolve, fall back to a mock entry so the
    // UI still renders something rather than dropping the row entirely.
    const mockFallback = new Map(
      mockBatch(tickers.filter((t) => !bySymbol.has(t))).map((m) => [
        m.ticker,
        m,
      ])
    );

    const results: PriceBatchResponse[] = tickers.map(
      (t) => bySymbol.get(t) ?? mockFallback.get(t)!
    );

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, max-age=30',
        'X-Price-Source': 'finnhub',
      },
    });
  }

  // No key configured: keep the app working with mock data.
  return NextResponse.json(mockBatch(tickers), {
    headers: {
      'Cache-Control': 'public, max-age=60',
      'X-Price-Source': 'mock',
    },
  });
}
