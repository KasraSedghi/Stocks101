import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get('ticker')?.toUpperCase();
  const timeframe = (searchParams.get('timeframe') || '1M') as Timeframe;

  if (!ticker || !/^[A-Z]{1,5}$/.test(ticker)) {
    return NextResponse.json(
      { error: 'Invalid ticker' },
      { status: 400 }
    );
  }

  // Determine number of data points based on timeframe
  const dataPointsMap: Record<Timeframe, number> = {
    '1D': 24,   // 24 hours
    '5D': 30,   // 5 days, ~6h intervals
    '1M': 20,   // ~1.5 day intervals
    '3M': 60,   // ~1.5 day intervals
    '6M': 52,   // ~week intervals
    '1Y': 52,   // Week intervals
    '3Y': 36,   // Month intervals
    'MAX': 24,  // Month intervals
  };

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
      'Cache-Control': 'public, max-age=300', // 5 minute cache
    },
  });
}
