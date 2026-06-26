# Getting Started with ShadowVest

A step-by-step guide to set up your personal stock portfolio tracker from scratch. Estimated time: **15-20 minutes**.

## Step 1: Sign Up for Free Services

### 1a. Supabase (Database & Auth)

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Sign Up"** → Use email or GitHub
3. Create a new project (name: "shadowvest")
4. Once ready, go to **Settings → API Keys** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 1b. Agent Toolbelt (Stock Data API)

1. Go to **[agenttoolbelt.live](https://agenttoolbelt.live)**
2. Enter your email → Get your free API key instantly
3. Copy your API key → `AGENT_TOOLBELT_API_KEY`

**Free tier: 250 calls/month, 10 requests/minute.**

## Step 2: Clone & Install Project

```bash
cd ~/projects
git clone <your-repo-url> shadowvest
cd shadowvest
npm install
```

## Step 3: Set Up Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your API keys from Step 1
```

## Step 4: Create Database Tables

1. Open Supabase dashboard
2. Go to SQL Editor
3. Copy & paste from `migrations/001_init_schema.sql`
4. Click "Run"

## Step 5: Start Dev Server

```bash
npm run dev
# Open http://localhost:3000
```

## Step 6: Test the App

1. Sign up with email
2. Add a transaction (AAPL, BUY, 10 shares, $150 each)
3. Check dashboard (should show Net Worth = $1,500)
4. Test chat terminal ("Is Apple a good buy?")

That's it! You're ready to use ShadowVest! 🚀
