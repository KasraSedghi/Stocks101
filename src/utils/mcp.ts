import { fetchAgentToolbeltAnalysis } from '@/lib/agentToolbelt';

export type MCPTool =
  | 'stock_thesis'
  | 'earnings_analysis'
  | 'insider_signal'
  | 'valuation_snapshot'
  | 'bear_vs_bull';

export function extractTicker(message: string, lastTicker?: string): string | null {
  // Common English words that are not stock tickers
  const commonWords = new Set([
    'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
    'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW',
    'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY',
    'DID', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'WHAT', 'WHICH',
    'BEAT', 'MISS', 'EARNINGS', 'SHOULD', 'VALUATION', 'IS', 'IN', 'AT',
    'UP', 'OR', 'AS', 'BE', 'BY', 'DO', 'GO', 'IF', 'NO', 'TO', 'SO',
    'WILL', 'HAVE', 'WITH', 'WOULD', 'COULD', 'ABOUT', 'JUST', 'THEM',
    'THAN', 'SOME', 'TIME', 'VERY', 'WHEN', 'THEN', 'BULL', 'BEAR', 'CASE',
    'WHAT', 'THAT', 'THIS'
  ]);

  // Try to find ticker after common question keywords (more likely to be the ticker)
  const contextPatterns = [
    /(?:for|about|of|on)\s+([A-Z]{1,5})\b/i,
    /([A-Z]{1,5})\s+(?:stock|ticker|symbol)\b/i,
  ];

  for (const pattern of contextPatterns) {
    const match = message.match(pattern);
    if (match && !commonWords.has(match[1].toUpperCase())) {
      return match[1].toUpperCase();
    }
  }

  // Fall back to finding all 1-5 letter uppercase words, filter commons
  const allMatches = message.match(/\b([A-Z]{1,5})\b/gi);
  if (allMatches) {
    // Prefer matches from the end of the message (more likely to be the ticker)
    for (let i = allMatches.length - 1; i >= 0; i--) {
      const upper = allMatches[i].toUpperCase();
      if (!commonWords.has(upper)) {
        return upper;
      }
    }
  }

  return lastTicker || null;
}

export function determineIntent(message: string): MCPTool {
  const lower = message.toLowerCase();

  // Earnings analysis keywords
  if (
    lower.includes('earnings') ||
    lower.includes('beat') ||
    lower.includes('miss') ||
    lower.includes('revenue')
  ) {
    return 'earnings_analysis';
  }

  // Insider trading keywords
  if (
    lower.includes('insider') ||
    lower.includes('13f') ||
    lower.includes('buying') ||
    lower.includes('selling')
  ) {
    return 'insider_signal';
  }

  // Valuation keywords
  if (
    lower.includes('p/e') ||
    lower.includes('pe ratio') ||
    lower.includes('valuation') ||
    lower.includes('overvalued') ||
    lower.includes('undervalued') ||
    lower.includes('cheap') ||
    lower.includes('expensive')
  ) {
    return 'valuation_snapshot';
  }

  // Bull/bear case keywords
  if (
    lower.includes('bull') ||
    lower.includes('bear') ||
    lower.includes('upside') ||
    lower.includes('downside') ||
    lower.includes('case for') ||
    lower.includes('case against')
  ) {
    return 'bear_vs_bull';
  }

  // Default: stock thesis for buy/sell/general questions
  return 'stock_thesis';
}

export async function routeMCPQuery(
  ticker: string,
  tool: MCPTool,
  usageCount: number
): Promise<string> {
  // This runs server-side (from the chat route), so call the Agent Toolbelt
  // API directly rather than round-tripping through an internal API route.
  if (usageCount < 250) {
    const analysis = await fetchAgentToolbeltAnalysis(ticker, tool);

    if (analysis.ok && analysis.text) {
      return analysis.text;
    }

    // On rate limit or any failure, degrade to a useful fallback message.
    return formatFallbackResponse(ticker, tool, analysis.status);
  }

  // Quota exhausted locally.
  return formatFallbackResponse(ticker, tool);
}

function formatFallbackResponse(
  ticker: string,
  tool: MCPTool,
  status?: number
): string {
  if (status === 429) {
    return `**${ticker} — Rate Limited**\n\nAgent Toolbelt is temporarily rate limiting requests (max 10/min). Wait a moment and try again.`;
  }

  const toolDescriptions = {
    stock_thesis: `**${ticker} Stock Thesis**\n\nNo real-time data available. Consider this stock based on:\n- Historical performance\n- Sector trends\n- Management quality`,
    earnings_analysis: `**${ticker} Earnings Analysis**\n\nReal-time earnings data unavailable. Check earnings calendar for scheduled reports.`,
    insider_signal: `**${ticker} Insider Activity**\n\nNo current insider trading signals available. Check SEC filings for recent activity.`,
    valuation_snapshot: `**${ticker} Valuation Snapshot**\n\nValuation data currently unavailable. Check financial statements for P/E and other metrics.`,
    bear_vs_bull: `**${ticker} Bull vs Bear Case**\n\nNo structured analysis available. Review analyst reports and market sentiment.`,
  };

  return toolDescriptions[tool];
}
