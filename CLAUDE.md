# ShadowVest Portfolio Tracker

An AI-augmented personal stock portfolio dashboard utilizing Model Context Protocol (MCP) servers to ingest live stock market intelligence, historical trends, and institutional research. The application allows users to securely manage mock stock transactions, view real-time portfolio performance, calculate gains/losses, and leverage a sidebar AI chat assistant for rapid investment analysis.

## Core Application Overview

- **Aesthetic:** High-contrast cyberpunk dark theme (Matte black `#07070A`, neon purple `#8B5CF6`, and vibrant green `#10B981` for gains).
- **Security Barrier:** Strict authentication layer via Supabase. No dashboard data is exposed unless a user session is active.
- **Data Integrity:** The system computes dynamic financial positions (Average Cost Basis, Unrealized Gains/Losses, Realized Gains) mathematically in real-time based on a user's transaction ledger.
- **Market Data Integration:** Bridges `agent-toolbelt-mcp` (free tier: 250 requests/mo) and `maverick-mcp` (local Python server) into a custom workspace terminal chat interface.

## Technical Architecture

### Frontend Stack
- **Framework:** Next.js (App Router) with React 18+
- **Styling:** Tailwind CSS with custom dark theme tokens
- **Components:** shadcn/ui (Radix UI + Tailwind)
- **Charts:** Recharts for time-series visualization
- **Icons:** Lucide-react

### Backend Stack
- **Database:** Supabase (PostgreSQL) — free tier with auth included
- **Authentication:** Supabase Auth (Email/Password, OAuth)
- **API Routes:** Next.js API routes + Express.js middleware for MCP bridging
- **MCP Orchestration:** Two integration paths:
  1. **Agent Toolbelt** — Cloud HTTP API (250 free calls/month)
  2. **Maverick MCP** — Local Python server (39+ tools, free tier via Tiingo API)

## Data Schema

### `transactions` Table (PostgreSQL)
Permanent ledger of every buy/sell activity:
```sql
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    transaction_type VARCHAR(4) CHECK (transaction_type IN ('BUY', 'SELL')) NOT NULL,
    shares NUMERIC(12, 4) NOT NULL,
    price_per_share NUMERIC(12, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### `watchlists` Table (PostgreSQL)
Tracks tickers a user wants to monitor:
```sql
CREATE TABLE watchlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, ticker)
);
```

## MCP Tool Integration

### Agent Toolbelt (Cloud-Based)
**Free Tier:** 250 calls/month, 10 req/min
**Tools:** stock_thesis, earnings_analysis, insider_signal, valuation_snapshot, bear_vs_bull

### Maverick MCP (Local Python Server)
**Cost:** Free (runs on your machine)
**Tools:** 39+ financial analysis tools (RSI, MACD, backtesting, etc.)

## Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Agent Toolbelt:** https://agenttoolbelt.live
- **Maverick MCP:** https://github.com/wshobson/maverick-mcp
