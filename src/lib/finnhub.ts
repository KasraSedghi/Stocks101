/**
 * Finnhub market-data client (server-only).
 *
 * Free tier: 60 requests/minute, real-time US equity quotes.
 *   Quote:    GET https://finnhub.io/api/v1/quote?symbol=AAPL&token=KEY
 *             -> { c: current, d: change, dp: percentChange, pc: prevClose, ... }
 *   Profile:  GET https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=KEY
 *             -> { name, ... }
 *
 * NOTE: Finnhub's free tier does NOT include historical candles (/stock/candle
 * is premium-only). This client covers real-time quotes + company names, which
 * is what portfolio valuation and the watchlist need.
 *
 * Reads FINNHUB_API_KEY from the environment — never import into a client component.
 */

const API_BASE = 'https://finnhub.io/api/v1';
const REQUEST_TIMEOUT_MS = 8_000;
const QUOTE_TTL_MS = 60_000; // cache quotes for 1 min to respect rate limits
const PROFILE_TTL_MS = 24 * 60 * 60 * 1000; // company names rarely change

export interface Quote {
  ticker: string;
  price: number;
  change: number;
  changePct: number;
  companyName: string;
}

export function isFinnhubConfigured(): boolean {
  return !!process.env.FINNHUB_API_KEY;
}

interface CacheEntry<T> {
  value: T;
  expires: number;
}

// Module-level caches persist across requests within a server instance.
const quoteCache = new Map<string, CacheEntry<Omit<Quote, 'companyName'>>>();
const profileCache = new Map<string, CacheEntry<string>>();

async function finnhubGet(
  path: string,
  params: Record<string, string>
): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;

  const search = new URLSearchParams({ ...params, token: apiKey });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${path}?${search}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.error(`Finnhub ${path} returned ${res.status}`);
      return null;
    }
    return (await res.json()) as Record<string, unknown>;
  } catch (err) {
    console.error(`Finnhub ${path} failed:`, err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function getCompanyName(ticker: string): Promise<string> {
  const cached = profileCache.get(ticker);
  if (cached && cached.expires > Date.now()) return cached.value;

  const data = await finnhubGet('/stock/profile2', { symbol: ticker });
  const name =
    data && typeof data.name === 'string' && data.name ? data.name : ticker;

  profileCache.set(ticker, { value: name, expires: Date.now() + PROFILE_TTL_MS });
  return name;
}

/**
 * Fetch a real-time quote + company name for a single ticker.
 * Returns null when unavailable (no key, unknown symbol, or API error) so the
 * caller can fall back gracefully.
 */
export async function getQuote(ticker: string): Promise<Quote | null> {
  const symbol = ticker.toUpperCase();

  const cached = quoteCache.get(symbol);
  let base: Omit<Quote, 'companyName'> | null =
    cached && cached.expires > Date.now() ? cached.value : null;

  if (!base) {
    const data = await finnhubGet('/quote', { symbol });
    const c = typeof data?.c === 'number' ? data.c : 0;
    // Finnhub returns c === 0 for unknown/invalid symbols.
    if (!data || c <= 0) return null;

    base = {
      ticker: symbol,
      price: c,
      change: typeof data.d === 'number' ? data.d : 0,
      changePct: typeof data.dp === 'number' ? data.dp : 0,
    };
    quoteCache.set(symbol, { value: base, expires: Date.now() + QUOTE_TTL_MS });
  }

  const companyName = await getCompanyName(symbol);
  return { ...base, companyName };
}

/**
 * Fetch quotes for many tickers in parallel. Unresolvable tickers are omitted.
 */
export async function getQuotes(tickers: string[]): Promise<Quote[]> {
  const unique = Array.from(new Set(tickers.map((t) => t.toUpperCase())));
  const results = await Promise.all(unique.map((t) => getQuote(t)));
  return results.filter((q): q is Quote => q !== null);
}
