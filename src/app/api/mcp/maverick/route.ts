import { NextRequest, NextResponse } from 'next/server';

export interface MaverickMCPRequest {
  ticker: string;
  tool: string;
}

export interface MaverickMCPResponse {
  result: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: MaverickMCPRequest = await request.json();
    const { ticker, tool } = body;

    if (!ticker || !tool) {
      return NextResponse.json(
        { error: 'ticker and tool are required' },
        { status: 400 }
      );
    }

    // In production, call local Maverick MCP server
    // http://localhost:5000/analyze?ticker=AAPL&tool=rsi
    // For now, return mock response

    const mockTools: Record<string, string> = {
      rsi: `RSI(14) for ${ticker}: 45.2 (Neutral zone, no overbought/oversold signal)`,
      macd: `MACD for ${ticker}: Signal bullish crossover potential`,
      bollinger_bands: `Bollinger Bands for ${ticker}: Price trading near middle band, moderate volatility`,
      support_resistance: `Support: $150.20 | Resistance: $165.80`,
      moving_averages: `50MA: $158.50 | 200MA: $155.30 (Bullish alignment)`,
    };

    const result =
      mockTools[tool as keyof typeof mockTools] ||
      `**${ticker} - ${tool} Analysis**\n\nLocal analysis from Maverick MCP coming soon.`;

    return NextResponse.json<MaverickMCPResponse>({
      result,
    });
  } catch (err) {
    console.error('Maverick MCP error:', err);
    return NextResponse.json(
      { error: 'Failed to call Maverick MCP' },
      { status: 500 }
    );
  }
}
