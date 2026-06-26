import { NextRequest, NextResponse } from 'next/server';

export interface AgentToolbeltRequest {
  ticker: string;
  tool: string;
}

export interface AgentToolbeltResponse {
  result: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AgentToolbeltRequest = await request.json();
    const { ticker, tool } = body;

    if (!ticker || !tool) {
      return NextResponse.json(
        { error: 'ticker and tool are required' },
        { status: 400 }
      );
    }

    // In production, call actual Agent Toolbelt API
    // https://agenttoolbelt.live/api/analyze?ticker=AAPL&tool=stock_thesis
    // For now, return mock response

    const mockResponse = `**${ticker} ${tool}**\n\nAgent Toolbelt integration coming soon. This is a demonstration response.`;

    return NextResponse.json<AgentToolbeltResponse>({
      result: mockResponse,
    });
  } catch (err) {
    console.error('Agent Toolbelt API error:', err);
    return NextResponse.json(
      { error: 'Failed to call Agent Toolbelt' },
      { status: 500 }
    );
  }
}
