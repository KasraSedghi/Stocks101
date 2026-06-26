import { NextRequest, NextResponse } from 'next/server';
import { extractTicker, determineIntent, routeMCPQuery } from '@/utils/mcp';

export interface ChatRequest {
  message: string;
  history: Array<{ role: string; content: string }>;
  ticker?: string;
}

interface ChatResponse {
  response: string;
  usageCount: number;
}

// Simple in-memory usage tracking (in production, use Supabase)
const usageTracker = new Map<string, { count: number; resetDate: Date }>();

function getUserUsageCount(userId: string): number {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format

  const tracker = usageTracker.get(userId);

  // Reset if month has changed
  if (
    !tracker ||
    tracker.resetDate.toISOString().slice(0, 7) !== currentMonth
  ) {
    usageTracker.set(userId, { count: 0, resetDate: now });
    return 0;
  }

  return tracker.count;
}

function incrementUsageCount(userId: string): number {
  const now = new Date();
  const tracker = usageTracker.get(userId);

  if (!tracker) {
    usageTracker.set(userId, { count: 1, resetDate: now });
    return 1;
  }

  tracker.count++;
  return tracker.count;
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth header or session
    const userId = request.headers.get('x-user-id') || 'demo-user';

    const body: ChatRequest = await request.json();
    const { message, ticker: providedTicker } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Extract ticker from message or use provided
    const ticker =
      extractTicker(message, providedTicker) ||
      providedTicker ||
      'UNKNOWN';

    // Determine intent
    const intent = determineIntent(message);

    // Get current usage count
    const usageCount = getUserUsageCount(userId);

    // Route to MCP and get response
    let response: string;
    if (usageCount < 250) {
      response = await routeMCPQuery(ticker, intent, usageCount);
    } else {
      response = `**${ticker} Analysis - Quota Exceeded**

You've reached your monthly limit of 250 Agent Toolbelt calls.
Analysis is currently unavailable. Your quota resets next month.`;
    }

    // Increment usage count
    const newUsageCount = incrementUsageCount(userId);

    return NextResponse.json<ChatResponse>({
      response,
      usageCount: newUsageCount,
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
