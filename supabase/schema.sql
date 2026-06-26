-- ShadowVest Database Schema
-- Run this in the Supabase SQL Editor:
--   Dashboard → SQL Editor → New query → paste → Run
-- Safe to re-run (uses IF NOT EXISTS / idempotent policies).

-- ============================================================
-- transactions: permanent ledger of every buy/sell activity
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    transaction_type VARCHAR(4) CHECK (transaction_type IN ('BUY', 'SELL')) NOT NULL,
    shares NUMERIC(12, 4) NOT NULL,
    price_per_share NUMERIC(12, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_ticker_idx ON public.transactions(ticker);

-- ============================================================
-- watchlists: tickers a user wants to monitor
-- ============================================================
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, ticker)
);

CREATE INDEX IF NOT EXISTS watchlists_user_id_idx ON public.watchlists(user_id);

-- ============================================================
-- Row Level Security: users can only see/modify their own rows
-- ============================================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- transactions policies
DROP POLICY IF EXISTS "Users manage own transactions" ON public.transactions;
CREATE POLICY "Users manage own transactions"
    ON public.transactions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- watchlists policies
DROP POLICY IF EXISTS "Users manage own watchlists" ON public.watchlists;
CREATE POLICY "Users manage own watchlists"
    ON public.watchlists
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
