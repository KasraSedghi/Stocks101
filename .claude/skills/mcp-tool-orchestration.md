---
name: MCP Tool Orchestration
description: Route chat queries to correct MCP tools with intent detection, caching, and rate limit handling
context: ShadowVest stock research chat terminal
---

# MCP Tool Orchestration Skill

## Purpose
Enable intelligent routing of user questions to appropriate MCP tools (Agent Toolbelt cloud API or Maverick MCP local server), with smart caching and rate limit management to stay within free tier limits.

## Core Responsibilities
1. **Intent Recognition** — Parse user message to identify research need
2. **Ticker Extraction** — Find stock symbols in natural language
3. **Tool Selection** — Route to Agent Toolbelt vs Maverick MCP
4. **Response Formatting** — Present results in clear, actionable format
5. **Cache Management** — Avoid duplicate API calls within TTL windows

## Intent Types

### 1. **stock_thesis** → Fundamental Analysis
**When:** "Should I buy AAPL?", "Is Tesla overvalued?", "Tell me about Microsoft"  
**Provider:** Agent Toolbelt  
**TTL:** 3600 seconds (1 hour)  
**Response Style:** Analyst opinion with bull/bear arguments

### 2. **earnings_analysis** → Quarterly Results
**When:** "Did Apple beat earnings?", "What were TSLA's Q4 results?", "Earnings date?"  
**Provider:** Agent Toolbelt  
**TTL:** 86400 seconds (24 hours)  
**Response Style:** Fact-based metrics with analyst expectations

### 3. **insider_signal** → Insider Trading Activity
**When:** "Are insiders buying?", "CEO selling stock", "Insider activity in MSFT"  
**Provider:** Agent Toolbelt  
**TTL:** 3600 seconds (1 hour)  
**Response Style:** Signal strength (bullish/bearish/neutral) with recent activity

### 4. **valuation_snapshot** → Price Multiples & Metrics
**When:** "What's the P/E ratio?", "Price-to-book?", "Valuation metrics"  
**Provider:** Agent Toolbelt or Maverick MCP  
**TTL:** 300 seconds (5 minutes)  
**Response Style:** Table of metrics with sector comparisons

### 5. **bear_vs_bull** → Debate Format
**When:** "Bull case for Apple?", "Why might it fail?", "Risks vs opportunities"  
**Provider:** Agent Toolbelt  
**TTL:** 3600 seconds (1 hour)  
**Response Style:** Two-column pros/cons or bull/bear case

## Implementation Rules

### Rule 1: Intent Detection from Natural Language
```typescript
function determineIntent(userMessage: string): MCPToolName {
  const lower = userMessage.toLowerCase();
  
  // Earnings queries
  if (/earn|eps|revenue|guidance|beat|miss/.test(lower)) {
    return 'earnings_analysis';
  }
  
  // Insider queries
  if (/insider|executive|ceo|cfo|director|bought|sold/.test(lower)) {
    return 'insider_signal';
  }
  
  // Valuation queries
  if (/p\/e|p\/b|multiple|valuation|ratio/.test(lower)) {
    return 'valuation_snapshot';
  }
  
  // Debate queries
  if (/bull|bear|case|risk|opportunity|why|fail|succeed/.test(lower)) {
    return 'bear_vs_bull';
  }
  
  // Default: general thesis
  return 'stock_thesis';
}
```

### Rule 2: Ticker Extraction
Extract one or more stock symbols from user message:
```typescript
function extractTicker(message: string): string[] {
  // Match 1-5 uppercase letters, word boundary
  const regex = /\b([A-Z]{1,5})\b/g;
  const matches = message.match(regex) || [];
  return [...new Set(matches)]; // deduplicate
}

// Example: "Should I buy AAPL or MSFT?" → ['AAPL', 'MSFT']
```

### Rule 3: Route Based on Availability
```typescript
async function routeMCPQuery(
  message: string,
  agentToolbeltKey: string,
  maverickUrl?: string
): Promise<MCPQueryResult> {
  const intent = determineIntent(message);
  const ticker = extractTicker(message)[0]; // use first ticker
  
  // Agent Toolbelt has all tools
  if (agentToolbeltKey) {
    return callAgentToolbelt(intent, ticker, agentToolbeltKey);
  }
  
  // Fallback to Maverick if available
  if (maverickUrl) {
    return callMaverickMCP(intent, ticker, maverickUrl);
  }
  
  // No API available
  throw new Error('No MCP provider configured');
}
```

### Rule 4: Response Formatting (Persona)
Format responses as a **decisive, data-backed analyst**:
```typescript
// Good response:
"📊 Apple (AAPL) is undervalued at current levels.
• P/E ratio: 28x (vs sector avg 22x)
• EPS growth: +15% YoY
• Analyst consensus: BUY ($195 target)

Bull case: Services expansion, AI integration
Bear case: China exposure, saturation"

// Bad response:
"Apple is a good stock because people like iPhones"
```

### Rule 5: Cache Strategy
```typescript
const CACHE_TTL = {
  stock_thesis: 3600,         // 1 hour
  earnings_analysis: 86400,   // 24 hours
  insider_signal: 3600,       // 1 hour
  valuation_snapshot: 300,    // 5 minutes
  bear_vs_bull: 3600          // 1 hour
};

function getCachedResponse(ticker: string, tool: MCPToolName): MCPQueryResult | null {
  const key = `${ticker}:${tool}`;
  const cached = cache.get(key);
  
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL[tool] * 1000) {
    cache.delete(key); // expired
    return null;
  }
  
  return cached.response;
}
```

### Rule 6: Rate Limit Handling
Agent Toolbelt: 250 calls/month, 10 req/minute

```typescript
async function callAgentToolbelt(
  tool: MCPToolName,
  ticker: string,
  apiKey: string
): Promise<MCPQueryResult> {
  // Check rate limit
  const callCount = getRateLimit('agent-toolbelt');
  if (callCount >= 250) {
    throw new RateLimitError(
      'Agent Toolbelt monthly limit reached. Try again next month.'
    );
  }
  
  const response = await fetch('https://api.agenttoolbelt.live/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tool, ticker })
  });
  
  if (response.status === 429) {
    throw new RateLimitError('Rate limited. Wait 60 seconds.');
  }
  
  incrementRateLimit('agent-toolbelt');
  return response.json();
}
```

## Common Patterns

### Pattern 1: Multi-Ticker Query
```typescript
// "Should I buy AAPL, MSFT, or GOOGL?"
// Strategy: Process first ticker, offer to query others

const tickers = extractTicker(userMessage);
const primary = tickers[0];

let response = await routeMCPQuery(message, apiKey, maverickUrl);

if (tickers.length > 1) {
  response.note = `Analyzed ${primary}. Ask about ${tickers.slice(1).join(', ')} separately?`;
}
```

### Pattern 2: Follow-up Context
```typescript
// User: "Tell me about AAPL"
// Claude: "Apple shows strong earnings growth..."
// User: "What about valuation?"
// Strategy: Reuse ticker from previous message

if (!extractTicker(userMessage).length && lastTicker) {
  // No ticker in message, use previous
  const intent = determineIntent(userMessage); // detects valuation_snapshot
  return routeMCPQuery(
    userMessage + ` ${lastTicker}`,
    apiKey,
    maverickUrl
  );
}
```

### Pattern 3: Graceful Degradation
```typescript
try {
  return await callAgentToolbelt(intent, ticker, apiKey);
} catch (error) {
  if (error instanceof RateLimitError) {
    // Rate limited → suggest alternative
    if (maverickUrl) {
      return await callMaverickMCP(intent, ticker, maverickUrl);
    }
    return {
      status: 'error',
      message: 'Free API limit reached. Try again tomorrow.',
      alternative: 'Run Maverick MCP locally for unlimited queries'
    };
  }
  throw error;
}
```

## Guardrails

- ✅ **Always extract ticker first** before calling API
- ✅ **Check cache before API call** (saves quota)
- ✅ **Validate response format** before returning to user
- ✅ **Handle rate limits gracefully** (suggest Maverick local option)
- ✅ **Log all API calls** for quota monitoring
- ✅ **Timeout queries after 10 seconds** (prevent hanging)

## Testing Checklist

When implementing orchestration:
- [ ] Intent detection works for all 5 tool types
- [ ] Ticker extraction finds symbols in mixed text
- [ ] Cache prevents duplicate API calls within TTL
- [ ] Rate limit prevents >250 calls/month
- [ ] Response formatting is consistent across tools
- [ ] Follow-up messages reuse previous ticker
- [ ] Graceful fallback when API unavailable

## Files to Reference
- `src/utils/mcp.ts` — Implementation
- `src/types/index.ts` — MCPToolName enum, MCPQueryResult type
- `src/pages/api/mcp/agent-toolbelt.ts` — API route example
- `src/pages/api/mcp/status.ts` — Rate limit monitoring
