import { NextRequest, NextResponse } from 'next/server';

export interface MCPStatusResponse {
  agentToolbelt: {
    available: boolean;
    usedThisMonth: number;
    remaining: number;
  };
  maverickMCP: {
    available: boolean;
    url: string;
  };
  timestamp: string;
}

export async function GET(request: NextRequest) {
  // userId will be used in production for per-user quota tracking
  request.headers.get('x-user-id');

  // In production, fetch from Supabase or persistent storage
  // For now, return demo data
  const usedThisMonth = 42;
  const remaining = 250 - usedThisMonth;

  const response: MCPStatusResponse = {
    agentToolbelt: {
      available: true,
      usedThisMonth,
      remaining,
    },
    maverickMCP: {
      available: false,
      url: 'http://localhost:5000',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
