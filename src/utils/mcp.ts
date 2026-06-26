export type MCPTool =
  | 'stock_thesis'
  | 'earnings_analysis'
  | 'insider_signal'
  | 'valuation_snapshot'
  | 'bear_vs_bull';

export function extractTicker(message: string, lastTicker?: string): string | null {
  // Match 1-5 uppercase letters (or lowercase that we'll convert)
  const match = message.match(/\b([A-Z]{1,5})\b/i);
  if (match) {
    return match[1].toUpperCase();
  }
  // Return last used ticker as fallback
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
  // Primary: use Agent Toolbelt if under limit
  if (usageCount < 250) {
    try {
      const response = await fetch('/api/mcp/agent-toolbelt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, tool }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.result || formatFallbackResponse(ticker, tool);
      }

      if (response.status === 429) {
        // Rate limited, try fallback
        return callMaverickMCP(ticker, tool);
      }

      throw new Error('Agent Toolbelt request failed');
    } catch (err) {
      console.error('Agent Toolbelt error:', err);
      return callMaverickMCP(ticker, tool);
    }
  }

  // Fallback: Maverick MCP
  return callMaverickMCP(ticker, tool);
}

async function callMaverickMCP(ticker: string, tool: MCPTool): Promise<string> {
  try {
    const response = await fetch('/api/mcp/maverick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, tool }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.result || formatFallbackResponse(ticker, tool);
    }

    return formatFallbackResponse(ticker, tool);
  } catch (err) {
    console.error('Maverick MCP error:', err);
    return formatFallbackResponse(ticker, tool);
  }
}

function formatFallbackResponse(ticker: string, tool: MCPTool): string {
  const toolDescriptions = {
    stock_thesis: `**${ticker} Stock Thesis**\n\nNo real-time data available. Consider this stock based on:\n- Historical performance\n- Sector trends\n- Management quality`,
    earnings_analysis: `**${ticker} Earnings Analysis**\n\nReal-time earnings data unavailable. Check earnings calendar for scheduled reports.`,
    insider_signal: `**${ticker} Insider Activity**\n\nNo current insider trading signals available. Check SEC filings for recent activity.`,
    valuation_snapshot: `**${ticker} Valuation Snapshot**\n\nValuation data currently unavailable. Check financial statements for P/E and other metrics.`,
    bear_vs_bull: `**${ticker} Bull vs Bear Case**\n\nNo structured analysis available. Review analyst reports and market sentiment.`,
  };

  return toolDescriptions[tool];
}
