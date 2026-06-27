# How ShadowVest Works

A plain-English tour of what's built and why it's built that way. Written for someone who knows the project exists but wants to understand the machinery underneath.

---

## 1. The Big Picture

ShadowVest is three things stacked on top of each other:

1. **A ledger app** — you log BUY/SELL transactions, it computes what you own and whether you're up or down.
2. **A live data layer** — real stock prices and historical charts pulled from third-party APIs, with safe fallbacks if those APIs are unavailable.
3. **An AI research terminal** — a chat box that turns your questions ("is NVDA overvalued?") into calls to a financial-analysis API and renders the answer.

Nothing is stored about *what the stock market is doing* — only what *you did* (your trades) is stored in the database. Prices and analysis are fetched live every time, not stored permanently. This is a deliberate choice: it means your portfolio math is always recalculated from the source of truth (your transactions), not from a stale cached number.

---

## 2. The Database (Supabase / PostgreSQL)

### Why Supabase
Supabase gives you a real Postgres database *and* authentication *and* a REST API on top of it, for free, without running your own server. You get a login system and a database in one sign-up.

### The two tables

**`transactions`** — [supabase/schema.sql](supabase/schema.sql)
Every buy or sell you've ever logged. One row per trade:
```
ticker | transaction_type (BUY/SELL) | shares | price_per_share | transaction_date
```
This is the *only* permanent financial record in the app. Nothing else is derived data — your current holdings, gains, and losses are all *computed on the fly* from this table (see §4).

**`watchlists`**
Just a list of tickers you want to keep an eye on, tied to your user ID. Simple lookup table, no math involved.

### Row Level Security (RLS) — the part that's easy to miss
Every table has this rule attached at the database level:
```sql
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)
```
This means **Postgres itself** refuses to return or accept rows that don't belong to the logged-in user — even if there were a bug in the app code that forgot to filter by `user_id`, the database would still block it. This is why CLAUDE.md calls it a "Security Barrier": the protection lives below the application layer, not just inside it.

---

## 3. Authentication

[src/hooks/useAuth.tsx](src/hooks/useAuth.tsx) wraps the entire app in a React Context (`AuthProvider`) that:
- Asks Supabase "is there a logged-in session?" once on page load (`getSession()`)
- Subscribes to `onAuthStateChange` so if you log in/out in one tab, every component reacts instantly
- Exposes `signUp`, `signIn`, `signOut`, `resetPassword`, `updatePassword` as simple functions any component can call via `useAuth()`

Every page that needs a logged-in user wraps itself in `<ProtectedRoute>`, which checks `user` from this context and redirects to `/auth/login` if it's empty. The actual *enforcement*, though, is the RLS rule above — `ProtectedRoute` is just a UX nicety so you don't see a blank dashboard before being bounced.

---

## 4. The Financial Math (the part that makes this a "real" tracker, not a toy)

[src/utils/financial.ts](src/utils/financial.ts) — `aggregatePortfolio()`

This is the core algorithm. Given your raw transaction list and today's live prices, it answers: *what do I own, what did it cost me, and what's it worth now?*

**Why FIFO (First-In-First-Out):**
If you bought 10 shares of AAPL at $150, then 10 more at $180, then sold 10 — which 10 did you sell? Tax law (and ShadowVest) assumes you sold the *oldest* ones first. This matters because it changes your realized gain: selling the $150 lot for $200 books a $50/share gain; selling the $180 lot books only $20/share.

The algorithm:
1. Sort all transactions oldest-first.
2. Walk through them, keeping a per-ticker queue of "lots" (each BUY pushes a lot onto the queue with its price and share count).
3. On a SELL, pull shares off the *front* of the queue (oldest first), calculate the gain for each lot consumed, and shrink/remove lots as needed.
4. Whatever's left in the queues at the end is your current holdings — averaged into one cost basis per ticker.

**Why `decimal.js` instead of plain JavaScript numbers:**
JavaScript's native numbers are binary floating point, so `0.1 + 0.2 !== 0.3`. For most apps that's a cosmetic rounding bug. For a financial ledger doing thousands of share/price multiplications, those tiny errors compound into real cent-level mismatches. `decimal.js` does exact decimal arithmetic, so totals always reconcile.

**The output** (`PortfolioMetrics`): total invested, total current value, unrealized gain/loss (paper gains on what you still hold), realized gain (locked-in profit from completed sells), and net worth. All derived, none stored.

---

## 5. Live Price Data — and the fallback pattern used everywhere

Real market data costs money or has tight free-tier limits, so every integration in this app follows the same shape:

```
Is the API key configured?
  ├─ Yes → call the real API
  │         ├─ Success → return real data, tag response with X-Price-Source: <api-name>
  │         └─ Failure → fall through to mock data
  └─ No  → return mock data
                tag response with X-Price-Source: mock
```

You can literally check which one served you by looking at that response header — `curl -I` any price endpoint and see `X-Price-Source: finnhub` vs `mock`.

### Current price — Finnhub
[src/lib/finnhub.ts](src/lib/finnhub.ts) → [src/app/api/prices/batch/route.ts](src/app/api/prices/batch/route.ts)
- Free tier: 60 requests/minute, real-time-ish quotes.
- One ticker's quote is cached in memory for 60 seconds, company name for 24 hours — so refreshing the dashboard a dozen times in a minute doesn't burn through your quota.
- [src/hooks/usePortfolio.ts](src/hooks/usePortfolio.ts) calls this endpoint once on load and then every 60 seconds, building a `{ ticker: price }` map that the FIFO calculator (§4) consumes.
- **Important gap:** Finnhub's free tier has no historical data — only the live quote. That's why charts needed a second API.

### Historical chart — Tiingo
[src/lib/tiingo.ts](src/lib/tiingo.ts) → [src/app/api/prices/route.ts](src/app/api/prices/route.ts)
- Free tier: 30+ years of daily end-of-day data, but **no intraday** — there's no real concept of "today's price every hour."
- Each chart timeframe (5D, 1M, 3M... MAX) maps to a date range and a "resample frequency": short ranges pull daily closes, 3Y pulls weekly, MAX pulls monthly (otherwise a 25-year daily chart would be thousands of data points for nothing — the eye can't see that resolution anyway).
- The `1D` timeframe is the **one place real data is structurally impossible** on the free tier — it always shows the mock sine-wave generator, by design, because Tiingo simply has no intraday candles to offer.

### Why two separate APIs instead of one
Neither free tier covers both jobs (live tick + deep history), so the app uses Finnhub for "what's it worth right now" and Tiingo for "what did it do over time" — different tools for different jobs, same fallback pattern wrapping both.

---

## 6. The AI Research Terminal

This is the most "alive" feature in the app — a chat box that answers investment questions using a real financial-analysis API, not a canned script. Here's the full path a message takes:

```
You type "is NVDA overvalued?" and hit send
        │
        ▼
ChatTerminal.tsx (the UI)
        │  calls sendMessage() from useChat.ts
        ▼
useChat.ts — adds your message to state, POSTs to /api/chat
        │
        ▼
/api/chat/route.ts (server)
        │  1. extractTicker("is NVDA overvalued?") → "NVDA"
        │  2. determineIntent(...) → sees "overvalued" → "valuation_snapshot"
        │  3. checks your monthly usage count (capped at 250)
        ▼
routeMCPQuery() in utils/mcp.ts
        │  calls fetchAgentToolbeltAnalysis("NVDA", "valuation_snapshot")
        ▼
agentToolbelt.ts (server-only client)
        │  POST https://www.agenttoolbelt.live/api/tools/valuation-snapshot
        │  Authorization: Bearer <your key>   Body: { ticker: "NVDA" }
        ▼
Agent Toolbelt's real backend does the analysis, returns JSON
        │
        ▼
formatResult() turns that JSON into readable markdown-ish text
        │  ("**Valuation**\n...", "**Bull Case**\n...", etc.)
        ▼
Response flows back up through /api/chat → useChat → ChatTerminal
        │
        ▼
ChatTerminal renders it, converting **bold** and URLs into styled HTML
```

### Two pieces of "intelligence" worth calling out

**Ticker extraction** (`extractTicker` in [src/utils/mcp.ts](src/utils/mcp.ts)) — there's no NLP model here, it's pattern matching: it looks for capital-letter words near phrases like "for/about/of" or before "stock/ticker", filters out a hand-built list of common English words that happen to be all-caps-able ("THE", "ARE", "ITS"...), and falls back to your *previous* ticker if it can't find a new one — so "what about its earnings?" correctly stays on the same stock you were just discussing.

**Intent routing** (`determineIntent`) — keyword matching decides *which* of five analysis tools to call: mentions of "earnings/beat/miss" → earnings analysis, "insider/13f" → insider signal, "P/E/overvalued/cheap" → valuation snapshot, "bull/bear/upside" → bull-vs-bear case, and everything else defaults to a general stock thesis.

### Where it's reachable
- [src/components/GlobalChatLauncher.tsx](src/components/GlobalChatLauncher.tsx) renders a floating purple chat button in the bottom-right corner of *every* page (wired into [Layout.tsx](src/components/Layout.tsx)), so you're never more than one click away from asking a question, not just from a stock's detail page.

### Why fallbacks exist here too
If `AGENT_TOOLBELT_API_KEY` is missing, the call times out, or you've burned your 250 free calls for the month, `formatFallbackResponse()` returns a generic-but-still-useful templated answer instead of an error message — the chat never just breaks, it degrades.

### A real bug that was hiding in here
Originally, the server-side `/api/chat` route tried to reach the *other* server-side route (`/api/mcp/agent-toolbelt`) using a relative URL fetch (`fetch('/api/mcp/agent-toolbelt')`). In Next.js, server-side code calling a relative path like that doesn't resolve to anything — it silently fails. That meant the chat was *always* hitting its fallback text, even after the real API was wired up, because it never actually reached it. The fix was to call the Agent Toolbelt client function directly instead of routing through an internal HTTP hop.

---

## 7. The Component Layer (the visual building blocks)

Rather than hand-building buttons, modals, and tables for every page, there's a small internal design system in [src/components/](src/components/), all built on the color/spacing tokens in [src/config/design-tokens.ts](src/config/design-tokens.ts) — so "neon purple" or "matte black" is defined exactly once and every component just references it.

A few worth knowing:
- **Button.tsx** — one component handles every button style (primary/secondary/danger/ghost) and size via *variant props* rather than copy-pasted CSS classes; passing `loading` swaps its contents for a spinner automatically.
- **Table.tsx** — generic over any data shape (`<Table<T>>`); give it columns and rows and it handles sorting, loading skeletons, and "no data" states without rewriting that logic per page.
- **Modal.tsx** — handles its own Escape-key listener and click-outside-to-close, so any feature that needs a popup just drops content into it.
- **PriceChart.tsx / TimeframeToggle.tsx** — the chart UI; this is the *consumer* of the `/api/prices` endpoint described in §5, completely unaware of whether the data underneath is real (Tiingo) or mock — it just renders whatever `{dates, prices}` it's given.

The point of this layer: every page reuses the same primitives, so the cyberpunk theme stays consistent without re-implementing styling logic in twenty different files.

---

## 8. Why things are organized this way (the patterns repeated everywhere)

A few rules show up again and again across the codebase, on purpose:

1. **Server-only API clients never touch the browser.** `finnhub.ts`, `tiingo.ts`, and `agentToolbelt.ts` all read secret API keys from `process.env`. They're only ever imported by files under `src/app/api/.../route.ts` (server routes), never by a `'use client'` component — otherwise the API keys would ship to every visitor's browser in the JavaScript bundle.
2. **Compute, don't store, derived data.** Holdings, gains, and net worth are never written to the database — they're recalculated from `transactions` every time, using live prices. This guarantees the numbers you see are never stale relative to either your trade history or the market.
3. **Real data with a mock escape hatch, everywhere.** Every external API integration assumes it might be unconfigured, rate-limited, or down, and has a pre-built fallback so the UI never shows a broken state — just a degraded one (and a header that tells you which mode you're in, if you go looking).

---

## Quick Reference: "Where do I look if..."

| Question | File |
|---|---|
| How is my gain/loss calculated? | [src/utils/financial.ts](src/utils/financial.ts) |
| Where do live prices come from? | [src/lib/finnhub.ts](src/lib/finnhub.ts), [src/app/api/prices/batch/route.ts](src/app/api/prices/batch/route.ts) |
| Where does the chart's historical data come from? | [src/lib/tiingo.ts](src/lib/tiingo.ts), [src/app/api/prices/route.ts](src/app/api/prices/route.ts) |
| How does the chat know what stock I'm asking about? | [src/utils/mcp.ts](src/utils/mcp.ts) — `extractTicker` |
| How does the chat decide what kind of analysis to run? | [src/utils/mcp.ts](src/utils/mcp.ts) — `determineIntent` |
| What actually calls the AI analysis API? | [src/lib/agentToolbelt.ts](src/lib/agentToolbelt.ts) |
| How is login/session handled? | [src/hooks/useAuth.tsx](src/hooks/useAuth.tsx) |
| What does the database actually look like? | [supabase/schema.sql](supabase/schema.sql) |
