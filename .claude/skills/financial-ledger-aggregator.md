---
name: Financial Ledger Aggregator
description: Calculate FIFO cost basis, unrealized/realized gains with precision using transaction ledgers
context: ShadowVest portfolio tracker
---

# Financial Ledger Aggregator Skill

## Purpose
Calculate accurate portfolio metrics from immutable transaction ledgers using First-In-First-Out (FIFO) cost basis method. Ensures financial accuracy without float rounding errors.

## Core Responsibilities
1. **FIFO Cost Basis Calculation** — Track shares in/out with acquisition cost
2. **Unrealized Gains** — Current market value minus cost basis
3. **Realized Gains** — Gains locked in from completed SELL transactions
4. **Portfolio Aggregation** — Summarize across all holdings

## Implementation Rules

### Rule 1: FIFO Queue for Each Ticker
Maintain a queue of purchase batches by ticker:
```typescript
// For AAPL: bought 10 @ $100, then 5 @ $110
// When selling 12 shares:
// - Sell 10 @ $100 (realized gain based on sale price)
// - Sell 2 @ $110 (from next batch)
```

### Rule 2: Decimal.js for Financial Math
**NEVER** use JavaScript floats for money. Always use `Decimal.js`:
```typescript
import Decimal from 'decimal.js';
const costBasis = new Decimal('150.25').times(new Decimal('10'));
// Not: 150.25 * 10 (can have rounding errors)
```

### Rule 3: Immutable Transaction Ledger
- Transactions are **never edited or deleted** in the database
- Only way to "undo" is add an offsetting SELL or BUY
- This maintains audit trail and prevents data corruption

### Rule 4: Share Balance Validation
Before allowing a SELL:
- Verify total shares owned >= shares being sold
- Check against cost basis queue (only sell shares that were actually bought)
- Reject negative share positions

### Rule 5: Separate Realized vs Unrealized
```typescript
// Realized Gains: locked in from completed SELLs
realizedGain = (sellPrice - avgCostBasis) * sharesSold

// Unrealized Gains: on current holdings
unrealizedGain = (currentPrice - avgCostBasis) * sharesHeld
```

## Key Functions

### `aggregatePortfolio(transactions, livePrices)`
**Input:** Array of transactions, current market prices  
**Output:** PortfolioMetrics object

```typescript
// Returns:
{
  netWorth: 45230.50,           // current value of all holdings
  totalInvested: 40000.00,      // total buy value
  realizedGains: 2500.00,       // locked-in gains from sells
  totalUnrealizedGains: 2730.50,
  portfolioReturn: 6.825,       // percent gain
  holdings: [                   // by ticker
    {
      ticker: 'AAPL',
      totalShares: 25.5,
      avgCostBasis: 145.32,
      currentPrice: 165.00,
      unrealizedGain: 498.59
    }
  ]
}
```

### `calculateUnrealizedGainPercent(currentPrice, costBasis, shares)`
```typescript
const percent = ((currentPrice - costBasis) / costBasis) * 100;
// Example: (165 - 150) / 150 * 100 = 10%
```

### `validateTransaction(ticker, shares, price, currentHoldings)`
```typescript
// Returns: { valid: boolean, error?: string }
// Checks:
// - ticker is valid stock symbol (1-5 chars, uppercase)
// - shares > 0 and <= max (e.g., 10,000)
// - price > 0
// - For SELL: shares <= currently owned
```

## Common Patterns

### Pattern 1: Calculate Cost Basis After Transaction
```typescript
const fifoQueue = [];

function addBuyTransaction(shares, price) {
  fifoQueue.push({ shares, price });
}

function addSellTransaction(sharesToSell) {
  let remaining = sharesToSell;
  let realizedGain = 0;
  const sellPrice = getCurrentPrice();
  
  while (remaining > 0 && fifoQueue.length > 0) {
    const batch = fifoQueue[0];
    const soldFromBatch = Math.min(remaining, batch.shares);
    
    realizedGain += (sellPrice - batch.price) * soldFromBatch;
    batch.shares -= soldFromBatch;
    remaining -= soldFromBatch;
    
    if (batch.shares === 0) fifoQueue.shift();
  }
  
  return realizedGain;
}
```

### Pattern 2: Group Holdings by Ticker
```typescript
const byTicker = {};
transactions.forEach(t => {
  if (!byTicker[t.ticker]) {
    byTicker[t.ticker] = { buys: [], sells: [] };
  }
  if (t.transactionType === 'BUY') {
    byTicker[t.ticker].buys.push(t);
  } else {
    byTicker[t.ticker].sells.push(t);
  }
});

// Now process each ticker independently with FIFO
```

## Guardrails

- ✅ **Always verify share balance** before accepting a SELL
- ✅ **Use Decimal.js** for all price × share calculations
- ✅ **Never allow negative shares** (reject before saving)
- ✅ **Sort transactions chronologically** before FIFO processing
- ✅ **Test edge cases:** selling all shares, buying same stock multiple times, price fluctuations

## Testing Checklist

When implementing aggregation logic:
- [ ] Buy 10 @ $100, buy 5 @ $110, sell 12 → cost basis correct?
- [ ] Unrealized gain matches (price - avgCost) × shares?
- [ ] Realized gain calculated correctly for partial sales?
- [ ] Portfolio return = (netWorth - totalInvested) / totalInvested?
- [ ] Cannot sell more than owned (error thrown)?
- [ ] Decimal precision maintained (no float rounding)?

## Files to Reference
- `src/utils/financial.ts` — Implementation
- `src/types/index.ts` — PortfolioMetrics, Holding, Transaction types
- `migrations/001_init_schema.sql` — transactions table schema
