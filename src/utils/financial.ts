import Decimal from 'decimal.js';

// ============================================================================
// TYPES
// ============================================================================

export interface Transaction {
  id: string;
  user_id: string;
  ticker: string;
  transaction_type: 'BUY' | 'SELL';
  shares: number;
  price_per_share: number;
  transaction_date: string;
  created_at: string;
}

export interface Holding {
  ticker: string;
  shares: number;
  costBasis: number; // Average cost per share
  totalCost: number; // shares * costBasis
  currentPrice: number;
  currentValue: number; // shares * currentPrice
  unrealizedGain: number;
  unrealizedGainPct: number;
}

export interface PortfolioMetrics {
  holdings: Holding[];
  totalInvested: number; // Sum of all buy transactions
  totalValue: number; // Sum of current holdings value
  totalCash: number; // Proceeds from sells minus buys
  unrealizedGain: number;
  unrealizedGainPct: number;
  realizedGain: number; // Profit from completed sells
  netWorth: number; // totalValue + realizedGain (unrealized gains are in value)
}

export interface TransactionFormData {
  ticker: string;
  transaction_type: 'BUY' | 'SELL';
  shares: number;
  price_per_share: number;
  transaction_date: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

export function formatCurrency(value: number): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absValue);

  return isNegative ? `-${formatted}` : formatted;
}

export function formatPercent(value: number, showSign = true): string {
  const sign = value >= 0 ? '+' : '-';
  const absValue = Math.abs(value);
  const formatted = absValue.toFixed(2);
  return showSign ? `${sign}${formatted}%` : `${formatted}%`;
}

// ============================================================================
// PORTFOLIO CALCULATIONS
// ============================================================================

interface FIFOLot {
  shares: Decimal;
  pricePerShare: Decimal;
  purchaseDate: string;
}

export function aggregatePortfolio(
  transactions: Transaction[],
  currentPrices: Record<string, number>
): PortfolioMetrics {
  // Sort transactions by date (oldest first) for FIFO
  const sorted = [...transactions].sort(
    (a, b) =>
      new Date(a.transaction_date).getTime() -
      new Date(b.transaction_date).getTime()
  );

  // Track FIFO lots per ticker
  const fifoQueues: Record<string, FIFOLot[]> = {};
  let totalInvested = new Decimal(0);
  let realizedGain = new Decimal(0);

  // Process all transactions in order
  for (const txn of sorted) {
    const ticker = txn.ticker.toUpperCase();
    if (!fifoQueues[ticker]) {
      fifoQueues[ticker] = [];
    }

    const shares = new Decimal(txn.shares);
    const price = new Decimal(txn.price_per_share);

    if (txn.transaction_type === 'BUY') {
      // Add to FIFO queue
      fifoQueues[ticker].push({
        shares,
        pricePerShare: price,
        purchaseDate: txn.transaction_date,
      });
      totalInvested = totalInvested.plus(shares.times(price));
    } else {
      // SELL: Remove from FIFO queue (oldest first)
      let remainingShares = shares;
      while (remainingShares.greaterThan(0) && fifoQueues[ticker].length > 0) {
        const lot = fifoQueues[ticker][0]!;
        const sharesFromLot = Decimal.min(remainingShares, lot.shares);

        // Calculate realized gain for this lot
        const costOfLot = sharesFromLot.times(lot.pricePerShare);
        const proceedsOfLot = sharesFromLot.times(price);
        realizedGain = realizedGain.plus(proceedsOfLot.minus(costOfLot));

        // Update or remove lot
        lot.shares = lot.shares.minus(sharesFromLot);
        if (lot.shares.equals(0)) {
          fifoQueues[ticker].shift();
        }

        remainingShares = remainingShares.minus(sharesFromLot);
      }
    }
  }

  // Build holdings from remaining FIFO lots
  const holdings: Holding[] = [];
  let totalValue = new Decimal(0);
  let unrealizedGain = new Decimal(0);

  for (const ticker in fifoQueues) {
    const lots = fifoQueues[ticker]!;
    if (lots.length === 0) continue;

    const currentPrice = new Decimal(currentPrices[ticker] || 0);
    let totalShares = new Decimal(0);
    let totalCost = new Decimal(0);

    for (const lot of lots) {
      totalShares = totalShares.plus(lot.shares);
      totalCost = totalCost.plus(lot.shares.times(lot.pricePerShare));
    }

    const costBasis = totalShares.greaterThan(0)
      ? totalCost.dividedBy(totalShares)
      : new Decimal(0);
    const currentValue = totalShares.times(currentPrice);
    const holding: Holding = {
      ticker,
      shares: parseFloat(totalShares.toString()),
      costBasis: parseFloat(costBasis.toString()),
      totalCost: parseFloat(totalCost.toString()),
      currentPrice: parseFloat(currentPrice.toString()),
      currentValue: parseFloat(currentValue.toString()),
      unrealizedGain: parseFloat(currentValue.minus(totalCost).toString()),
      unrealizedGainPct:
        totalCost.greaterThan(0)
          ? parseFloat(
              currentValue
                .minus(totalCost)
                .dividedBy(totalCost)
                .times(100)
                .toString()
            )
          : 0,
    };

    holdings.push(holding);
    totalValue = totalValue.plus(currentValue);
    unrealizedGain = unrealizedGain.plus(holding.unrealizedGain);
  }

  const totalValueNum = parseFloat(totalValue.toString());
  const realizedGainNum = parseFloat(realizedGain.toString());
  const unrealizedGainNum = parseFloat(unrealizedGain.toString());
  const totalInvestedNum = parseFloat(totalInvested.toString());

  return {
    holdings: holdings.sort((a, b) => a.ticker.localeCompare(b.ticker)),
    totalInvested: totalInvestedNum,
    totalValue: totalValueNum,
    totalCash: 0, // Will be calculated from realized gains if needed
    unrealizedGain: unrealizedGainNum,
    unrealizedGainPct:
      totalInvestedNum > 0
        ? (unrealizedGainNum / totalInvestedNum) * 100
        : 0,
    realizedGain: realizedGainNum,
    netWorth: totalValueNum + realizedGainNum,
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateTransaction(
  form: TransactionFormData,
  currentHoldings: Holding[]
): ValidationResult {
  // Validate ticker
  if (!form.ticker || !/^[A-Z]{1,5}$/.test(form.ticker.toUpperCase())) {
    return {
      valid: false,
      error: 'Ticker must be 1-5 uppercase letters',
    };
  }

  // Validate shares
  if (!form.shares || form.shares <= 0) {
    return {
      valid: false,
      error: 'Shares must be greater than 0',
    };
  }

  // Validate price
  if (!form.price_per_share || form.price_per_share <= 0) {
    return {
      valid: false,
      error: 'Price must be greater than 0',
    };
  }

  // Validate date (not in future)
  const txnDate = new Date(form.transaction_date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (txnDate > today) {
    return {
      valid: false,
      error: 'Transaction date cannot be in the future',
    };
  }

  // For SELL: check sufficient shares
  if (form.transaction_type === 'SELL') {
    const holding = currentHoldings.find(
      (h) => h.ticker === form.ticker.toUpperCase()
    );
    const ownedShares = holding?.shares || 0;

    if (form.shares > ownedShares) {
      return {
        valid: false,
        error: `Insufficient shares. You own ${ownedShares.toFixed(4)} ${form.ticker.toUpperCase()}.`,
      };
    }
  }

  return { valid: true };
}

// ============================================================================
// UTILITIES
// ============================================================================

export function calculateEstimatedRealizedGain(
  holding: Holding,
  sellShares: number,
  sellPrice: number
): number {
  const proceeds = new Decimal(sellShares).times(sellPrice);
  const cost = new Decimal(sellShares).times(holding.costBasis);
  return parseFloat(proceeds.minus(cost).toString());
}
