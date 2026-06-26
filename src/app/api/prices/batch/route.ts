import { NextRequest, NextResponse } from 'next/server';

export interface PriceBatchResponse {
  ticker: string;
  price: number;
  change: number;
  changePct: number;
  companyName: string;
}

// Mock company names
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
    .filter((t) => /^[A-Z]{1,5}$/.test(t));

  if (tickers.length === 0) {
    return NextResponse.json(
      { error: 'Invalid ticker format' },
      { status: 400 }
    );
  }

  const seed = Math.floor(Date.now() / 5000); // Changes every 5 minutes
  const results: PriceBatchResponse[] = tickers.map((ticker) => {
    const mockData = generateMockPrice(ticker, seed);
    return {
      ticker,
      price: mockData.price,
      change: mockData.change,
      changePct: mockData.changePct,
      companyName: COMPANY_NAMES[ticker] || ticker,
    };
  });

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
}
