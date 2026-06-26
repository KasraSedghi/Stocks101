# MCP Server Integration Guide

Complete guide to setting up and using Model Context Protocol (MCP) servers with ShadowVest. Includes configuration, usage examples, and troubleshooting.

---

## Table of Contents

1. [What is MCP?](#what-is-mcp)
2. [Supported MCP Servers](#supported-mcp-servers)
3. [Configuration](#configuration)
4. [Usage Examples](#usage-examples)
5. [Troubleshooting](#troubleshooting)

---

## What is MCP?

**Model Context Protocol (MCP)** is Anthropic's standard for connecting AI models to external tools and data sources. ShadowVest uses MCP servers to:

- Fetch live stock data (Agent Toolbelt)
- Calculate technical indicators (Maverick)
- Access database operations (Supabase)
- Query GitHub repositories
- Run local development mocks

### MCP vs Traditional APIs

| Aspect | Traditional API | MCP Server |
|--------|-----------------|-----------|
| **Setup** | Manual integration | Standardized protocol |
| **Tool Discovery** | Manual documentation | Auto-discovered tools |
| **Error Handling** | Varies per API | Consistent format |
| **Resource Management** | Custom caching | Built-in rate limiting |
| **AI Integration** | Custom prompts | Automatic context building |

---

## Supported MCP Servers

### 1. **Agent Toolbelt** (Cloud, Free Tier)

**Purpose:** Stock research, fundamental analysis, earnings data

**Free Tier Limits:**
- 250 API calls/month
- 10 requests/minute
- No credit card required

**Available Tools:**
- `stock_thesis` — Bull/bear case, investment thesis
- `earnings_analysis` — Quarterly results, guidance
- `insider_signal` — Executive buying/selling
- `valuation_snapshot` — P/E, P/B, valuations
- `bear_vs_bull` — Two-sided analysis

**Setup:**
```bash
# 1. Visit agenttoolbelt.live
# 2. Enter email (no signup required)
# 3. Copy free API key
# 4. Add to .env.local
AGENT_TOOLBELT_API_KEY=your_key_here
```

**Example Usage:**
```typescript
import { callAgentToolbelt } from '@/utils/mcp';

const result = await callAgentToolbelt(
  'stock_thesis',
  'AAPL',
  process.env.AGENT_TOOLBELT_API_KEY
);
// Returns: { status: 'success', data: { ... }, cached: false }
```

---

### 2. **Maverick MCP** (Local Server, Free)

**Purpose:** Technical analysis, price history, backtesting

**Free Tier:**
- Unlimited local requests
- Requires Python 3.12+
- Runs on your machine

**Available Tools:**
- `price_history` — OHLCV candlesticks
- `technical_indicators` — RSI, MACD, Bollinger Bands
- `backtesting` — Strategy simulation
- `correlation` — Stock correlation analysis
- 35+ more financial tools

**Setup:**

```bash
# 1. Install Python 3.12+
brew install python@3.12  # macOS
# or download from python.org

# 2. Clone Maverick MCP
git clone https://github.com/wshobson/maverick-mcp.git
cd maverick-mcp

# 3. Install dependencies
uv sync

# 4. Start the server
make dev
# Server runs at http://localhost:5000

# 5. Add to .env.local
MAVERICK_MCP_URL=http://localhost:5000
```

**Example Usage:**
```typescript
import { callMaverickMCP } from '@/utils/mcp';

const result = await callMaverickMCP(
  'price_history',
  'TSLA',
  process.env.MAVERICK_MCP_URL
);
// Returns: { status: 'success', data: { prices: [...] }, cached: false }
```

---

### 3. **Supabase MCP** (Cloud Database)

**Purpose:** Database operations, transactions, user data

**Free Tier:**
- 500MB storage
- Real-time subscriptions
- Row-Level Security

**Available Tools:**
- `get_transactions` — Fetch user transactions
- `create_transaction` — Record buy/sell
- `get_watchlist` — Fetch watchlist
- `add_watchlist` — Add ticker
- `delete_watchlist` — Remove ticker

**Setup:**

```bash
# 1. Create Supabase account at supabase.com
# 2. Create new project (free)
# 3. Copy API keys from Settings → API
# 4. Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Example Usage:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data } = await supabase
  .from('transactions')
  .select('*')
  .order('transaction_date', { ascending: false });
```

---

### 4. **GitHub MCP** (Optional)

**Purpose:** Repository access, issue tracking, code analysis

**Free Tier:**
- 60 API calls/hour (unauthenticated)
- 5,000 calls/hour (authenticated)

**Setup:**

```bash
# 1. Create GitHub personal access token
# Settings → Developer settings → Personal access tokens → Tokens (classic)
# 2. Add to .env.local
GITHUB_TOKEN=ghp_xxx...
```

---

## Configuration

### Environment Variables

Create `.env.local` with all MCP server credentials:

```bash
# Required for chat functionality
AGENT_TOOLBELT_API_KEY=your_agent_toolbelt_key_here

# Optional: Enhanced technical analysis
MAVERICK_MCP_URL=http://localhost:5000

# Required for database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: GitHub integration
GITHUB_TOKEN=ghp_xxx...
```

### MCP Configuration File

All MCP server settings are centralized in `src/config/mcp.ts`:

```typescript
import { MCP_SERVERS, getEnabledServers } from '@/config/mcp';

// Check which servers are available
const enabledServers = getEnabledServers();
console.log(enabledServers); // [{ name: 'Agent Toolbelt', ... }, ...]

// Get specific server config
const agentConfig = getServerConfig('agent-toolbelt');
console.log(agentConfig.rateLimit); // { requestsPerMonth: 250, ... }
```

### Rate Limiting

Each MCP server respects its free tier limits:

```typescript
// From src/config/mcp.ts
const RATE_LIMITS = {
  'agent-toolbelt': {
    requestsPerMonth: 250,
    requestsPerMinute: 10,
  },
  'maverick': {
    requestsPerMonth: undefined, // unlimited
  },
  'supabase': {
    requestsPerMonth: undefined, // depends on storage
  },
};
```

---

## Usage Examples

### Example 1: Stock Research Chat

User asks: "Is Apple a good buy?"

```typescript
// 1. Detect intent
const intent = determineIntent(message); // → 'stock_thesis'

// 2. Extract ticker
const ticker = extractTicker(message); // → 'AAPL'

// 3. Route to MCP
const result = await routeMCPQuery(message, apiKey, maverickUrl);

// 4. Format response
// "📊 Apple (AAPL) shows strong fundamentals:
//  • P/E: 28x (sector avg 22x)
//  • EPS Growth: +15% YoY
//  • Analyst Consensus: BUY
//
//  Bull case: Services growth, ecosystem lock-in
//  Bear case: China exposure, saturation"
```

### Example 2: Technical Analysis

User asks: "What's TSLA's RSI?"

```typescript
// Route to Maverick MCP (local server)
const result = await callMaverickMCP(
  'technical_indicators',
  'TSLA',
  process.env.MAVERICK_MCP_URL
);

// Response includes RSI, MACD, Bollinger Bands, etc.
```

### Example 3: Database Operations

Record a buy transaction:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, anonKey);

await supabase.from('transactions').insert({
  ticker: 'AAPL',
  transaction_type: 'BUY',
  shares: 10.5,
  price_per_share: 150.25,
  transaction_date: new Date(),
});
```

---

## API Route Examples

### POST `/api/mcp/agent-toolbelt`

Request:
```json
{
  "tool": "stock_thesis",
  "ticker": "AAPL"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "ticker": "AAPL",
    "thesis": "...",
    "bullCase": "...",
    "bearCase": "..."
  },
  "cached": false,
  "timestamp": "2026-06-25T10:30:00Z"
}
```

### POST `/api/mcp/maverick`

Request:
```json
{
  "tool": "price_history",
  "ticker": "TSLA",
  "timeframe": "1M"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "prices": [
      { "date": "2026-05-25", "open": 180.5, "high": 182.0, "low": 179.5, "close": 181.25 },
      ...
    ]
  },
  "cached": true,
  "cacheAge": 125
}
```

### GET `/api/mcp/status`

Check which servers are available:

```json
{
  "timestamp": "2026-06-25T10:30:00Z",
  "servers": {
    "agentToolbelt": {
      "available": true,
      "requestsUsedThisMonth": 42,
      "requestsRemaining": 208
    },
    "maverickMcp": {
      "available": true,
      "endpoint": "http://localhost:5000"
    },
    "supabase": {
      "available": true,
      "endpoint": "https://xxx.supabase.co"
    }
  }
}
```

---

## Caching Strategy

Each MCP server has a caching strategy to maximize free tier usage:

### Agent Toolbelt Cache TTL

```typescript
stock_thesis:        3600s  (1 hour)
earnings_analysis:  86400s  (24 hours)
insider_signal:      3600s  (1 hour)
valuation_snapshot:   300s  (5 minutes)
bear_vs_bull:        3600s  (1 hour)
```

### Why These TTLs?

- **1 hour:** Stock prices, signals change frequently
- **24 hours:** Earnings don't update intraday
- **5 minutes:** Valuation metrics are fast-changing
- **Cache saves quota:** Same question within TTL = no API call

### Cache Example

```typescript
// First call: API hit
await routeMCPQuery("Is AAPL good?", apiKey); // +1 to quota

// Second call (within 1 hour): Cached
await routeMCPQuery("Is AAPL good?", apiKey); // +0 to quota (cached)

// Third call (after 1 hour): API hit
await routeMCPQuery("Is AAPL good?", apiKey); // +1 to quota (expired)
```

---

## Troubleshooting

### Error: "Agent Toolbelt limit reached"

```
RateLimitError: Agent Toolbelt monthly limit reached (250/250). Try again next month.
```

**Solution:**
1. Check `/api/mcp/status` for usage
2. Enable Maverick MCP for unlimited queries
3. Wait until next month for reset

### Error: "Cannot connect to Maverick MCP"

```
Error: Cannot reach Maverick MCP at http://localhost:5000
```

**Solution:**
```bash
# 1. Check Maverick is running
cd maverick-mcp && make dev

# 2. Verify endpoint in .env.local
MAVERICK_MCP_URL=http://localhost:5000

# 3. Test connection
curl http://localhost:5000/health
```

### Error: "Supabase connection failed"

```
Error: Invalid Supabase URL or API key
```

**Solution:**
1. Check `.env.local` has all 3 Supabase keys
2. Verify keys copied from Supabase dashboard
3. Check database tables exist (run migrations)
4. Test connection: `npx supabase status`

### Error: "404 Not Found" on API routes

```
POST /api/mcp/agent-toolbelt → 404
```

**Solution:**
1. Check file exists: `src/pages/api/mcp/agent-toolbelt.ts`
2. Restart dev server: `npm run dev`
3. Check route in `src/config/routes.ts` is correct

### Agent Toolbelt returning 429 (Rate Limited)

```
Response: { status: 429, message: "Rate limit exceeded" }
```

**Solution:**
1. Wait 60 seconds before next request
2. Use Maverick MCP instead (unlimited)
3. Implement exponential backoff in client

---

## Monitoring & Analytics

### Check Usage

```typescript
// Get MCP status and usage
const response = await fetch('/api/mcp/status');
const status = await response.json();

console.log(status.servers.agentToolbelt);
// { available: true, requestsUsedThisMonth: 42, requestsRemaining: 208 }
```

### Set Up Alerts

Monitor Agent Toolbelt quota:

```typescript
const { requestsRemaining } = status.servers.agentToolbelt;

if (requestsRemaining < 50) {
  console.warn('⚠️ Agent Toolbelt: Only 50 requests remaining this month');
  // Consider switching to Maverick MCP
}
```

---

## Best Practices

### ✅ DO

- **Cache aggressively** — Respect TTL windows
- **Check status endpoint** — Monitor quota usage
- **Use Maverick locally** — Unlimited for development
- **Handle errors gracefully** — Fallback to other providers
- **Log MCP calls** — Track usage for debugging

### ❌ DON'T

- **Hardcode API keys** — Use `.env.local`
- **Call same tool twice** — Check cache first
- **Ignore rate limits** — Respect free tier boundaries
- **Commit `.env.local`** — It's in `.gitignore` for a reason
- **Assume all servers available** — Check `getEnabledServers()`

---

## Quick Reference

```bash
# Start development with MCP servers
npm run dev                    # Starts Next.js

# In another terminal (if using Maverick)
cd maverick-mcp && make dev    # Starts Maverick on :5000

# Check MCP status
curl http://localhost:3000/api/mcp/status

# Monitor Agent Toolbelt usage
# Visit: agenttoolbelt.live/dashboard

# Monitor Supabase usage
# Visit: supabase.com/dashboard → Usage
```

---

## Resources

- **Agent Toolbelt:** https://agenttoolbelt.live
- **Maverick MCP:** https://github.com/wshobson/maverick-mcp
- **Supabase Docs:** https://supabase.com/docs
- **MCP Spec:** https://modelcontextprotocol.io

---

**Last Updated:** 2026-06-25  
**Status:** Complete  
**Next:** Deploy to Vercel with environment variables
