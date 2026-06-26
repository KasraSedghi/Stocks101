/**
 * Agent Toolbelt API client (server-only).
 *
 * Real REST API:
 *   POST https://www.agenttoolbelt.live/api/tools/<tool-kebab-case>
 *   Headers: Authorization: Bearer atb_...
 *   Body:    { "ticker": "NVDA" }
 *   Response: { success, tool, version, durationMs, cached, result: {...} }
 *
 * Free tier: 250 calls/month, 10 req/min.
 *
 * IMPORTANT: this module reads AGENT_TOOLBELT_API_KEY from the environment and
 * must never be imported into a client component.
 */

const API_BASE = 'https://www.agenttoolbelt.live/api/tools';

// Real analysis calls can take ~15-20s, so allow generous headroom.
const REQUEST_TIMEOUT_MS = 30_000;

// Internal snake_case tool name -> Agent Toolbelt kebab-case endpoint slug.
const TOOL_SLUGS: Record<string, string> = {
  stock_thesis: 'stock-thesis',
  earnings_analysis: 'earnings-analysis',
  insider_signal: 'insider-signal',
  valuation_snapshot: 'valuation-snapshot',
  bear_vs_bull: 'bear-vs-bull',
};

export interface AgentToolbeltResult {
  /** Markdown-ish text ready to render in the chat terminal. */
  text: string;
  /** True when the call succeeded against the live API. */
  ok: boolean;
  /** HTTP-ish status for the caller to branch on (e.g. 429 rate limit). */
  status: number;
  /** Whether Agent Toolbelt served this from its own cache. */
  cached?: boolean;
}

/**
 * Call the live Agent Toolbelt API for a given ticker + tool.
 * Returns a result object; never throws (errors are captured in `ok`/`status`).
 */
export async function fetchAgentToolbeltAnalysis(
  ticker: string,
  tool: string
): Promise<AgentToolbeltResult> {
  const apiKey = process.env.AGENT_TOOLBELT_API_KEY;
  if (!apiKey) {
    return {
      text: '',
      ok: false,
      status: 0,
    };
  }

  const slug = TOOL_SLUGS[tool] || tool.replace(/_/g, '-');
  const url = `${API_BASE}/${slug}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ticker: ticker.toUpperCase() }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        text: '',
        ok: false,
        status: response.status,
      };
    }

    const data = await response.json();
    if (!data?.success || !data?.result) {
      return { text: '', ok: false, status: response.status };
    }

    return {
      text: formatResult(ticker.toUpperCase(), data.result),
      ok: true,
      status: 200,
      cached: data.cached,
    };
  } catch (err) {
    // AbortError (timeout) or network failure.
    console.error('Agent Toolbelt call failed:', err);
    return { text: '', ok: false, status: 0 };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Turn an Agent Toolbelt result object into readable markdown for the terminal.
 * Handles the known stock-analysis shapes and degrades gracefully for any
 * unexpected fields so new tools still render something sensible.
 */
function formatResult(
  ticker: string,
  result: Record<string, unknown>
): string {
  const lines: string[] = [];

  // Header: "**NVDA — Nvidia Corporation**"
  const companyName =
    typeof result.companyName === 'string' ? result.companyName : '';
  lines.push(`**${ticker}${companyName ? ` — ${companyName}` : ''}**`);

  const sector = typeof result.sector === 'string' ? result.sector : '';
  const verdict = typeof result.verdict === 'string' ? result.verdict : '';
  if (sector || verdict) {
    const bits = [sector, verdict ? verdict.toUpperCase() : ''].filter(Boolean);
    lines.push(bits.join('  •  '));
  }
  lines.push('');

  // Fields rendered as labelled sections, in a sensible reading order.
  const SECTION_LABELS: Record<string, string> = {
    oneLiner: 'Summary',
    thesis: 'Thesis',
    bullCase: 'Bull Case',
    bearCase: 'Bear Case',
    moat: 'Moat',
    insiderRead: 'Insider Read',
    valuation: 'Valuation',
    earnings: 'Earnings',
    watchFor: 'Watch For',
    risks: 'Risks',
    catalysts: 'Catalysts',
    recommendation: 'Recommendation',
  };

  const handled = new Set([
    'ticker',
    'companyName',
    'sector',
    'verdict',
    'dataSources',
  ]);

  // Render known labelled sections first, in declared order.
  for (const [key, label] of Object.entries(SECTION_LABELS)) {
    if (key in result) {
      handled.add(key);
      const rendered = renderValue(result[key]);
      if (rendered) {
        lines.push(`**${label}**`);
        lines.push(rendered);
        lines.push('');
      }
    }
  }

  // Render any remaining unknown fields so nothing is silently dropped.
  for (const [key, value] of Object.entries(result)) {
    if (handled.has(key)) continue;
    const rendered = renderValue(value);
    if (rendered) {
      lines.push(`**${toTitleCase(key)}**`);
      lines.push(rendered);
      lines.push('');
    }
  }

  return lines.join('\n').trim();
}

function renderValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        const r = renderValue(item);
        return r ? `• ${r}` : '';
      })
      .filter(Boolean)
      .join('\n');
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const r = renderValue(v);
        return r ? `${toTitleCase(k)}: ${r}` : '';
      })
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

function toTitleCase(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
