import { NextRequest, NextResponse } from 'next/server';
import { fetchAgentToolbeltAnalysis } from '@/lib/agentToolbelt';

export interface AgentToolbeltRequest {
  ticker: string;
  tool: string;
}

export interface AgentToolbeltResponse {
  result: string;
  cached?: boolean;
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

    const analysis = await fetchAgentToolbeltAnalysis(ticker, tool);

    if (!analysis.ok) {
      // Surface rate-limit so callers can fall back; otherwise generic error.
      const status = analysis.status === 429 ? 429 : 502;
      return NextResponse.json(
        {
          error:
            analysis.status === 429
              ? 'Agent Toolbelt rate limit reached'
              : 'Agent Toolbelt request failed',
          status: analysis.status,
        },
        { status }
      );
    }

    return NextResponse.json<AgentToolbeltResponse>({
      result: analysis.text,
      cached: analysis.cached,
    });
  } catch (err) {
    console.error('Agent Toolbelt API error:', err);
    return NextResponse.json(
      { error: 'Failed to call Agent Toolbelt' },
      { status: 500 }
    );
  }
}
