import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalPrices, isTiingoConfigured, ResampleFreq } from '@/lib/tiingo';

export type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '3Y' | 'MAX';

interface PriceDataPoint {
  date: string;
  price: number;
}

interface PricesResponse {
  dates: string[];
  prices: number[];
  startDate: string;
  endDate: string;
}

function generateMockPrices(
  ticker: string,
  timeframe: Timeframe,
  dataPoints: number
): PriceDataPoint[] {
  const now = new Date();
  const result: PriceDataPoint[] = [];

  // Starting price varies by ticker for realism
  const basePrice = 100 + (ticker.charCodeAt(0) % 50);
  let currentPrice = basePrice;

  // Generate sinusoidal + noise pattern
  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date(now);

    // Adjust date based on timeframe
    if (timeframe === '1D') {
      date.setHours(date.getHours() - i * (24 / dataPoints));
    } else if (timeframe === '5D') {
      date.setDate(date.getDate() - (5 * i) / dataPoints);
    } else if (timeframe === '1M') {
      date.setDate(date.getDate() - (30 * i) / dataPoints);
    } else if (timeframe === '3M') {
      date.setDate(date.getDate() - (90 * i) / dataPoints);
    } else if (timeframe === '6M') {
      date.setDate(date.getDate() - (180 * i) / dataPoints);
    } else if (timeframe === '1Y') {
      date.setDate(date.getDate() - (365 * i) / dataPoints);
    } else if (timeframe === '3Y') {
      date.setDate(date.getDate() - (1095 * i) / dataPoints);
    } else {
      // MAX
      date.setDate(date.getDate() - (2555 * i) / dataPoints);
    }

    // Sinusoidal oscillation
    const phase = (i / dataPoints) * Math.PI * 4;
    const sine = Math.sin(phase) * 5;

    // Add noise
    const noise = (Math.random() - 0.5) * 2;

    // Random walk component
    currentPrice = currentPrice * (1 + (noise + sine) * 0.001);
    currentPrice = Math.max(currentPrice, basePrice * 0.7); // Floor
    currentPrice = Math.min(currentPrice, basePrice * 1.5); // Ceiling

    result.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2)),
    });
  }

  return result;
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

interface RangeConfig {
  daysBack: number;
  resampleFreq: ResampleFreq;
}

// Tiingo's EOD endpoint has no intraday granularity, so '1D' has no real
// equivalent here and is excluded — it always falls back to mock below.
const RANGE_CONFIG: Record<Exclude<Timeframe, '1D'>, RangeConfig> = {
  '5D': { daysBack: 10, resampleFreq: 'daily' }, // pad for weekends
  '1M': { daysBack: 35, resampleFreq: 'daily' },
  '3M': { daysBack: 95, resampleFreq: 'daily' },
  '6M': { daysBack: 185, resampleFreq: 'daily' },
  '1Y': { daysBack: 370, resampleFreq: 'daily' },
  '3Y': { daysBack: 3 * 365 + 5, resampleFreq: 'weekly' },
  MAX: { daysBack: 25 * 365, resampleFreq: 'monthly' },
};

const dataPointsMap: Record<Timeframe, number> = {
  '1D': 24,
  '5D': 30,
  '1M': 20,
  '3M': 60,
  '6M': 52,
  '1Y': 52,
  '3Y': 36,
  MAX: 24,
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get('ticker')?.toUpperCase();
  const timeframe = (searchParams.get('timeframe') || '1M') as Timeframe;

  if (!ticker || !/^[A-Z.]{1,6}$/.test(ticker)) {
    return NextResponse.json({ error: 'Invalid ticker' }, { status: 400 });
  }

  // Real data path: Tiingo historical EOD prices (no intraday on free tier,
  // so '1D' always uses mock).
  if (isTiingoConfigured() && timeframe !== '1D') {
    const config = RANGE_CONFIG[timeframe];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - config.daysBack);

    const points = await getHistoricalPrices(
      ticker,
      toDateStr(startDate),
      toDateStr(endDate),
      config.resampleFreq
    );

    if (points && points.length > 0) {
      const response: PricesResponse = {
        dates: points.map((p) => p.date),
        prices: points.map((p) => p.price),
        startDate: points[0].date,
        endDate: points[points.length - 1].date,
      };

      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, max-age=300',
          'X-Price-Source': 'tiingo',
        },
      });
    }
    // Falls through to mock if Tiingo returned nothing (bad symbol, etc).
  }

  const dataPoints = dataPointsMap[timeframe] || 20;
  const priceData = generateMockPrices(ticker, timeframe, dataPoints);

  const response: PricesResponse = {
    dates: priceData.map((p) => p.date),
    prices: priceData.map((p) => p.price),
    startDate: priceData[0]!.date,
    endDate: priceData[priceData.length - 1]!.date,
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'X-Price-Source': 'mock',
    },
  });
}
