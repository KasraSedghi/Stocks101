/**
 * Tiingo market-data client (server-only).
 *
 * Real historical end-of-day prices, free tier (30+ years of US equity history):
 *   GET https://api.tiingo.com/tiingo/daily/<ticker>/prices
 *       ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&resampleFreq=daily|weekly|monthly
 *   Header: Authorization: Token <key>
 *   Response: [{ date, close, adjClose, ... }, ...]
 *
 * NOTE: Tiingo's EOD endpoint has no intraday granularity — there is no real
 * "1D" candle series on the free tier. Callers should treat '1D' as
 * unsupported and fall back (e.g. to mock or to the latest daily close).
 *
 * Reads TIINGO_API_KEY from the environment — never import into a client component.
 */

const API_BASE = 'https://api.tiingo.com/tiingo/daily';
const REQUEST_TIMEOUT_MS = 10_000;

export type ResampleFreq = 'daily' | 'weekly' | 'monthly';

export interface HistoricalPoint {
  date: string; // YYYY-MM-DD
  price: number; // adjusted close
}

export function isTiingoConfigured(): boolean {
  return !!process.env.TIINGO_API_KEY;
}

/**
 * Fetch historical adjusted-close prices for a ticker between two dates.
 * Returns null on any failure (bad symbol, network error, no key) so the
 * caller can fall back to mock data.
 */
export async function getHistoricalPrices(
  ticker: string,
  startDate: string,
  endDate: string,
  resampleFreq: ResampleFreq = 'daily'
): Promise<HistoricalPoint[] | null> {
  const apiKey = process.env.TIINGO_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    startDate,
    endDate,
    resampleFreq,
    format: 'json',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(
      `${API_BASE}/${ticker.toUpperCase()}/prices?${params}`,
      {
        signal: controller.signal,
        headers: {
          Authorization: `Token ${apiKey}`,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      console.error(`Tiingo prices for ${ticker} returned ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return data
      .map((row: Record<string, unknown>) => {
        const date = typeof row.date === 'string' ? row.date.slice(0, 10) : '';
        const price =
          typeof row.adjClose === 'number'
            ? row.adjClose
            : typeof row.close === 'number'
              ? row.close
              : null;
        return date && price !== null ? { date, price } : null;
      })
      .filter((p): p is HistoricalPoint => p !== null);
  } catch (err) {
    console.error(`Tiingo prices for ${ticker} failed:`, err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
