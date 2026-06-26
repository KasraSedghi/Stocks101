# ShadowVest Feature List

Complete list of features to be built for the portfolio tracker. Organized by priority and component type.

---

## Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [Portfolio Management](#portfolio-management)
3. [Dashboard & Analytics](#dashboard--analytics)
4. [Charts & Visualizations](#charts--visualizations)
5. [Stock Research & Chat](#stock-research--chat)
6. [Watchlist Management](#watchlist-management)
7. [Stock Detail Pages](#stock-detail-pages)
8. [UI Components](#ui-components)
9. [Data & Performance](#data--performance)
10. [Settings & Preferences](#settings--preferences)

---

## Authentication & User Management

### 1. User Registration
- [ ] Sign up form (email + password)
- [ ] Password strength indicator
- [ ] Email validation
- [ ] Duplicate email check
- [ ] Terms of service checkbox
- [ ] Redirect to dashboard after signup
- [ ] Confirmation email (optional)

**File:** `src/pages/auth/signup.tsx`

### 2. User Login
- [ ] Login form (email + password)
- [ ] Password recovery link
- [ ] Remember me checkbox (persist session)
- [ ] Error messages (invalid credentials)
- [ ] Redirect to dashboard after login
- [ ] OAuth providers (Google, GitHub optional)

**File:** `src/pages/auth/login.tsx`

### 3. Password Reset
- [ ] Password reset form (email input)
- [ ] Reset email sent confirmation
- [ ] Reset token validation
- [ ] New password form
- [ ] Password strength indicator
- [ ] Success message and redirect

**File:** `src/pages/auth/password-reset.tsx`

### 4. Session Management
- [ ] Automatic session restoration on page load
- [ ] Session persistence (localStorage or Supabase)
- [ ] Logout functionality
- [ ] Session timeout (optional)
- [ ] Redirect unauthenticated users to login

**File:** `src/hooks/useAuth.ts`

### 5. User Profile (Optional)
- [ ] Profile page
- [ ] Display name
- [ ] Email display
- [ ] Account settings
- [ ] Delete account option

**File:** `src/pages/settings.tsx`

---

## Portfolio Management

### 6. Add Transaction (BUY)
- [ ] Transaction form
- [ ] Ticker input (text with autocomplete)
- [ ] Type selector (BUY / SELL radio)
- [ ] Shares input (decimal number)
- [ ] Price per share input (currency)
- [ ] Date picker (default = today)
- [ ] Form validation
- [ ] Submit button
- [ ] Success confirmation
- [ ] Add another option

**File:** `src/pages/transactions/add.tsx`

### 7. Add Transaction (SELL)
- [ ] Same as BUY but with additional checks:
  - Validate shares available (can't sell more than owned)
  - Show error if insufficient shares
  - Display available shares
  - Calculate realized gain
  - Show cost basis

**File:** `src/pages/transactions/add.tsx` (same form)

### 8. Transaction History
- [ ] List all transactions (paginated)
- [ ] Sort by date (newest first)
- [ ] Filter by ticker
- [ ] Filter by type (BUY/SELL)
- [ ] Show columns: Date | Ticker | Type | Shares | Price | Total
- [ ] Show realized gain per transaction
- [ ] Delete transaction (?)
- [ ] Export to CSV (optional)

**File:** `src/pages/transactions.tsx`

### 9. Transaction Validation
- [ ] Validate ticker format (1-5 chars, uppercase)
- [ ] Validate shares > 0
- [ ] Validate price > 0
- [ ] Validate date is in past
- [ ] Check SELL has sufficient shares available
- [ ] Prevent negative share positions
- [ ] Show user-friendly error messages

**File:** `src/utils/financial.ts`

### 10. Cost Basis Calculation (FIFO)
- [ ] Calculate average cost basis per holding
- [ ] Track cost basis per transaction (FIFO queue)
- [ ] Recalculate on new transactions
- [ ] Use Decimal.js for precision
- [ ] Display in portfolio metrics
- [ ] Use in gain/loss calculations

**File:** `src/utils/financial.ts::aggregatePortfolio()`

---

## Dashboard & Analytics

### 11. Dashboard Layout
- [ ] 3-column grid (desktop)
- [ ] Responsive on tablet (2 columns)
- [ ] Responsive on mobile (1 column)
- [ ] Header with navigation
- [ ] Sidebar or top nav
- [ ] User menu (profile, logout)

**File:** `src/pages/dashboard.tsx`

### 12. KPI Badges (Portfolio Metrics)
- [ ] Net Worth badge (current portfolio value)
  - Format: $XX,XXX.XX
  - Color: Gray (neutral)
  - Icon: Wallet
- [ ] Unrealized Gains badge
  - Format: +$X,XXX.XX / +X.XX%
  - Color: Green (positive) or Red (negative)
  - Icon: Trending up/down
- [ ] Realized Gains badge
  - Format: +$X,XXX.XX / +X.XX%
  - Color: Green (positive) or Red (negative)
  - Icon: Lock (locked in)
- [ ] Portfolio Return % badge
  - Format: +X.XX%
  - Color: Green or Red
  - Icon: Chart
- [ ] Total Invested badge
  - Format: $XX,XXX.XX
  - Icon: Credit card

**File:** `src/components/KPIBadge.tsx`, `src/pages/dashboard.tsx`

### 13. Holdings Summary
- [ ] List all holdings (one per ticker)
- [ ] Show columns: Ticker | Shares | Avg Cost | Current Price | Unrealized Gain
- [ ] Sort by value (largest first)
- [ ] Click ticker to go to stock detail
- [ ] Show gain/loss per holding
- [ ] Color code (green/red)
- [ ] Show allocation % of portfolio

**File:** `src/components/HoldingsList.tsx`

### 14. Allocation Breakdown
- [ ] Donut/pie chart of portfolio allocation
- [ ] By sector (optional)
- [ ] By industry (optional)
- [ ] By ticker (alternative)
- [ ] Hover shows percentage
- [ ] Click to filter holdings
- [ ] Mobile-responsive

**File:** `src/components/AllocationChart.tsx`

### 15. Recent Transactions
- [ ] Show last 5-10 transactions
- [ ] Table format: Date | Ticker | Type | Shares | Price | Total
- [ ] Buy: Green, Sell: Orange
- [ ] Link to transaction history page
- [ ] Real-time updates when new transaction added

**File:** `src/components/RecentTransactions.tsx`

---

## Charts & Visualizations

### 16. Price Chart Component
- [ ] Interactive Recharts area chart
- [ ] Show portfolio value over time (default)
- [ ] Show individual stock price (on detail page)
- [ ] Time-based x-axis
- [ ] Price-based y-axis
- [ ] Smooth curve (monotone type)
- [ ] Color: Green if gains, Red if losses
- [ ] Tooltip on hover (date + value)
- [ ] Responsive width (ResizeObserver)
- [ ] Loading state (skeleton)
- [ ] Error state (fallback message)

**File:** `src/components/PriceChart.tsx`

### 17. Timeframe Toggles
- [ ] 8 buttons: 1D | 5D | 1M | 3M | 6M | 1Y | 3Y | MAX
- [ ] Active button highlighted (purple border)
- [ ] All buttons inline (scroll on mobile if needed)
- [ ] Click to switch timeframe
- [ ] Loading state while switching
- [ ] Hover prefetch next timeframe (performance)
- [ ] Mobile-friendly button size (44x44px min)

**File:** `src/components/TimeframeToggle.tsx`

### 18. Transaction Markers on Chart
- [ ] Buy transaction: Purple ↓ marker on chart
- [ ] Sell transaction: Green ↑ marker on chart
- [ ] Hover shows transaction details
- [ ] Click to navigate to transaction
- [ ] Only show markers within visible timeframe
- [ ] Don't clutter chart (hide if too many)

**File:** `src/components/PriceChart.tsx`

### 19. Chart Data Caching
- [ ] Cache price data per timeframe
- [ ] Use useRef for in-memory cache
- [ ] Respect TTL per timeframe (5m to 1 week)
- [ ] Auto-invalidate expired cache
- [ ] Prefetch adjacent timeframes
- [ ] LocalStorage optional (for persistence)
- [ ] Show cache age in UI (optional)

**File:** `src/hooks/usePriceChart.ts`

### 20. Chart Performance Optimization
- [ ] Use Canvas rendering for 1000+ points
- [ ] Disable animations for large datasets
- [ ] Debounce resize listener (200ms)
- [ ] Lazy load Recharts library
- [ ] Memoize chart component (React.memo)
- [ ] Virtual scroll for very large datasets (optional)

**File:** `src/components/PriceChart.tsx`, `src/hooks/usePriceChart.ts`

---

## Stock Research & Chat

### 21. Chat Terminal Component
- [ ] Dark terminal-style container
- [ ] Purple left border (brand color)
- [ ] Message display area (scrollable)
- [ ] Message input field (bottom)
- [ ] Send button (or Enter to send)
- [ ] User messages (right aligned, gray background)
- [ ] Assistant messages (left aligned, no background)
- [ ] Loading indicator (typing...)
- [ ] Code blocks in responses (monospace)
- [ ] Link detection (clickable URLs)

**File:** `src/components/ChatTerminal.tsx`

### 22. Message History
- [ ] Display all messages in conversation
- [ ] Alternate user (right) and assistant (left)
- [ ] Show timestamp per message
- [ ] Scrollable container (max height)
- [ ] Auto-scroll to latest message
- [ ] Preserve history during session
- [ ] Option to clear history
- [ ] LocalStorage persistence (optional)

**File:** `src/hooks/useLocalStorage.ts`, `src/components/ChatTerminal.tsx`

### 23. Chat Input & Send
- [ ] Text input field (full width)
- [ ] Send button (paper plane icon)
- [ ] Send on Enter key
- [ ] Disable input while loading
- [ ] Clear input after send
- [ ] Show character count (optional)
- [ ] Focus input on mount
- [ ] Auto-expand textarea (optional)

**File:** `src/components/ChatTerminal.tsx`

### 24. Intent Detection
- [ ] Detect stock thesis ("should I buy AAPL?")
- [ ] Detect earnings analysis ("beat earnings?")
- [ ] Detect insider signal ("insiders buying?")
- [ ] Detect valuation request ("P/E ratio?")
- [ ] Detect bear vs bull ("bull case?")
- [ ] Default to stock_thesis if unclear
- [ ] Show intent in UI (optional)
- [ ] Allow manual tool selection (optional)

**File:** `src/utils/mcp.ts::determineIntent()`

### 25. Ticker Extraction
- [ ] Extract ticker from user message
- [ ] Support multiple tickers ("AAPL vs MSFT")
- [ ] Handle lowercase tickers ("aapl" → "AAPL")
- [ ] Handle ticker in different positions
- [ ] Validate extracted ticker (1-5 chars)
- [ ] Use previous ticker if none in current message
- [ ] Show extracted ticker in UI (optional)

**File:** `src/utils/mcp.ts::extractTicker()`

### 26. MCP Tool Routing
- [ ] Route to Agent Toolbelt (primary)
- [ ] Route to Maverick MCP (local, optional)
- [ ] Check availability of each server
- [ ] Fallback if primary unavailable
- [ ] Log which provider was used
- [ ] Handle provider-specific errors

**File:** `src/utils/mcp.ts::routeMCPQuery()`

### 27. Agent Toolbelt Integration
- [ ] Call Agent Toolbelt API
- [ ] Pass tool + ticker as parameters
- [ ] Parse response (JSON)
- [ ] Format response for display
- [ ] Handle errors (4xx, 5xx)
- [ ] Handle rate limits (429)
- [ ] Track API call count
- [ ] Show rate limit warnings

**File:** `src/utils/mcp.ts::callAgentToolbelt()`, `src/pages/api/mcp/agent-toolbelt.ts`

### 28. Maverick MCP Integration (Optional)
- [ ] Call local Maverick MCP server
- [ ] Connect to http://localhost:5000
- [ ] Parse Maverick responses
- [ ] Handle server not running gracefully
- [ ] Use for technical indicators
- [ ] Use for price history
- [ ] Fallback if Agent Toolbelt rate limited

**File:** `src/utils/mcp.ts::callMaverickMCP()`, `src/pages/api/mcp/maverick.ts`

### 29. Response Formatting
- [ ] Format as analyst persona (bold, decisive)
- [ ] Include metrics (P/E, growth rate, etc.)
- [ ] Show bull/bear arguments
- [ ] Use markdown formatting
- [ ] Highlight key numbers ($, %)
- [ ] Add emoji for visual appeal (optional)
- [ ] Link to sources (optional)
- [ ] Format tables for readability

**File:** `src/utils/mcp.ts`

### 30. Streaming Responses (Optional)
- [ ] Stream response token by token
- [ ] Show typing indicator while streaming
- [ ] Update message in real-time
- [ ] Handle stream errors
- [ ] Cancel ongoing request
- [ ] Show partial results on error

**File:** `src/pages/api/chat.ts`

### 31. Rate Limit Management
- [ ] Track Agent Toolbelt quota (250/month)
- [ ] Show remaining calls
- [ ] Warn when approaching limit
- [ ] Disable Agent Toolbelt when limit reached
- [ ] Suggest Maverick MCP as alternative
- [ ] Reset counter monthly (auto)
- [ ] Log all API calls

**File:** `src/utils/mcp.ts`, `src/pages/api/mcp/status.ts`

### 32. MCP Status Endpoint
- [ ] GET `/api/mcp/status`
- [ ] Return agent-toolbelt availability
- [ ] Return maverick-mcp availability
- [ ] Return API usage stats
- [ ] Return cache statistics
- [ ] Return health checks
- [ ] Return timestamp

**File:** `src/pages/api/mcp/status.ts`

---

## Watchlist Management

### 33. Add to Watchlist
- [ ] Button to add ticker to watchlist
- [ ] Input ticker (text with autocomplete)
- [ ] Validate ticker format
- [ ] Check for duplicates
- [ ] Success confirmation
- [ ] Add to watchlist table

**File:** `src/pages/watchlist.tsx`

### 34. Watchlist Table
- [ ] List all watched tickers
- [ ] Show columns: Ticker | Current Price | Change (%) | Change ($) | Action (Remove)
- [ ] Color code change (green/red)
- [ ] Sort by ticker or price
- [ ] Click ticker to view stock detail
- [ ] Remove button with confirmation
- [ ] Empty state message

**File:** `src/pages/watchlist.tsx`

### 35. Live Watchlist Prices
- [ ] Fetch current price for each ticker
- [ ] Auto-refresh every 5 minutes (or real-time)
- [ ] Show price change since last update
- [ ] Cache prices to avoid duplicate API calls
- [ ] Show loading state
- [ ] Handle missing/invalid tickers

**File:** `src/hooks/useWatchlist.ts`

### 36. Remove from Watchlist
- [ ] Remove button per ticker
- [ ] Confirmation dialog
- [ ] Delete from database
- [ ] Update UI
- [ ] Success message
- [ ] Undo option (optional)

**File:** `src/pages/watchlist.tsx`

---

## Stock Detail Pages

### 37. Stock Detail Page
- [ ] URL: `/stock/[ticker]`
- [ ] Dynamic route based on ticker
- [ ] Header with stock name + ticker
- [ ] Price chart (multi-timeframe)
- [ ] Key metrics panel
- [ ] Company info (optional)
- [ ] News feed (optional)
- [ ] Buy/Sell buttons
- [ ] Add to watchlist button
- [ ] Back button

**File:** `src/pages/stock/[ticker].tsx`

### 38. Stock Price Chart
- [ ] Large, prominent chart
- [ ] All 8 timeframes available
- [ ] Transaction markers (if user owns stock)
- [ ] Full-width responsive
- [ ] Legend with current price
- [ ] YTD change indicator

**File:** `src/components/PriceChart.tsx` (reused)

### 39. Key Metrics Panel
- [ ] Current price
- [ ] Day's change ($ and %)
- [ ] 52-week range
- [ ] Market cap (if available)
- [ ] P/E ratio (from MCP)
- [ ] Dividend yield (optional)
- [ ] Beta
- [ ] Volume

**File:** `src/components/StockMetrics.tsx`

### 40. Buy/Sell Quick Actions
- [ ] Quick buy button (opens transaction form)
- [ ] Quick sell button (if user owns)
- [ ] Pre-fills ticker in form
- [ ] Opens modal or navigates to form
- [ ] Button position: sticky at bottom or sidebar

**File:** `src/components/QuickActions.tsx`

### 41. Add to Watchlist from Detail
- [ ] Button to add ticker to watchlist
- [ ] Show current watchlist status
- [ ] Toggle button (add/remove)
- [ ] Success/error feedback

**File:** `src/pages/stock/[ticker].tsx`

### 42. Company Info Card (Optional)
- [ ] Company name + sector + industry
- [ ] Business description (summary)
- [ ] Headquarters location
- [ ] Website link
- [ ] Fetch from data source or MCP

**File:** `src/components/CompanyInfo.tsx`

---

## UI Components

### 43. Navigation / Layout
- [ ] Header/navbar
- [ ] Logo + app name (ShadowVest)
- [ ] Navigation links (Dashboard, Transactions, Watchlist)
- [ ] User menu (Profile, Logout)
- [ ] Mobile hamburger menu
- [ ] Active page indicator
- [ ] Responsive layout

**File:** `src/components/Navigation.tsx`, `src/components/Layout.tsx`

### 44. Sidebar (Optional)
- [ ] Alternative to top nav
- [ ] Collapsible on mobile
- [ ] Menu items with icons
- [ ] Active indicator
- [ ] User profile section
- [ ] Dark theme styling

**File:** `src/components/Sidebar.tsx`

### 45. Form Component (Reusable)
- [ ] Input field (text, number, email)
- [ ] Label
- [ ] Error message
- [ ] Validation feedback
- [ ] Required indicator (*)
- [ ] Disabled state
- [ ] Focus styling
- [ ] Accessibility (aria labels)

**File:** `src/components/Form/Input.tsx`

### 46. Button Component
- [ ] Primary button (purple)
- [ ] Secondary button (gray)
- [ ] Danger button (red)
- [ ] Disabled state
- [ ] Loading state (spinner)
- [ ] Icon support (left/right)
- [ ] Size variants (sm, md, lg)
- [ ] Full width option

**File:** `src/components/Button.tsx`

### 47. Modal/Dialog Component
- [ ] Overlay background
- [ ] Centered modal
- [ ] Close button
- [ ] Title
- [ ] Body content
- [ ] Action buttons
- [ ] Keyboard escape to close
- [ ] Scrollable body

**File:** `src/components/Modal.tsx`

### 48. Table Component
- [ ] Sortable columns
- [ ] Alternating row colors
- [ ] Hover state
- [ ] Column alignment (left/center/right)
- [ ] Optional checkboxes
- [ ] Responsive (horizontal scroll on mobile)
- [ ] Loading state
- [ ] Empty state

**File:** `src/components/Table.tsx`

### 49. Card Component
- [ ] Dark panel background
- [ ] Subtle border
- [ ] Padding + border radius
- [ ] Shadow
- [ ] Optional header
- [ ] Optional footer
- [ ] Size variants

**File:** `src/components/Card.tsx`

### 50. Loading Spinner
- [ ] Animated rotating icon
- [ ] Purple color (brand)
- [ ] Size variants
- [ ] With optional text message
- [ ] Full page overlay option

**File:** `src/components/Spinner.tsx`

### 51. Skeleton Loader
- [ ] Placeholder while loading
- [ ] Pulsing animation
- [ ] Matches expected content size
- [ ] Dark theme colors
- [ ] Multiple skeletons for lists

**File:** `src/components/Skeleton.tsx`

### 52. Toast Notification
- [ ] Bottom right position
- [ ] Auto-dismiss (5s default)
- [ ] Success (green)
- [ ] Error (red)
- [ ] Info (blue)
- [ ] Warning (yellow)
- [ ] Close button
- [ ] Queue multiple toasts

**File:** `src/components/Toast.tsx`, `src/hooks/useToast.ts`

### 53. Error Message
- [ ] Inline error (under input)
- [ ] Error page (404, 500)
- [ ] Error boundary (global)
- [ ] User-friendly messages
- [ ] Retry button (optional)
- [ ] Report error link (optional)

**File:** `src/components/ErrorMessage.tsx`, `src/pages/_error.tsx`

### 54. Search/Autocomplete
- [ ] Input with dropdown
- [ ] Ticker suggestions
- [ ] Highlight matching text
- [ ] Keyboard navigation (up/down/enter)
- [ ] Click to select
- [ ] Clear button
- [ ] Debounced search

**File:** `src/components/Autocomplete.tsx`

### 55. Date Picker
- [ ] Calendar widget
- [ ] Select date
- [ ] Default to today
- [ ] Disable future dates
- [ ] Month/year navigation
- [ ] Keyboard support
- [ ] Mobile-friendly

**File:** `src/components/DatePicker.tsx`

### 56. Number Input
- [ ] Accept decimal numbers
- [ ] Up/down arrows
- [ ] Min/max validation
- [ ] Currency formatting (optional)
- [ ] Thousand separator
- [ ] Decimal places control

**File:** `src/components/NumberInput.tsx`

---

## Data & Performance

### 57. Portfolio State Management
- [ ] Store transactions in Supabase
- [ ] Cache portfolio metrics
- [ ] Real-time updates on transaction
- [ ] Recalculate metrics when price changes
- [ ] Use Zustand or React Context

**File:** `src/hooks/usePortfolio.ts`, `src/store/portfolio.ts`

### 58. Live Price Updates (Optional)
- [ ] Poll for price updates every 60s
- [ ] WebSocket for real-time (optional)
- [ ] Update holdings metrics
- [ ] Update watchlist prices
- [ ] Update chart (add latest candle)
- [ ] Handle connection loss

**File:** `src/hooks/usePrices.ts`

### 59. Currency Formatting
- [ ] Format as USD ($XX,XXX.XX)
- [ ] Use Intl.NumberFormat
- [ ] Show +/- for changes
- [ ] Handle large numbers (millions, billions)
- [ ] Locale-aware

**File:** `src/utils/financial.ts::formatCurrency()`

### 60. Percentage Formatting
- [ ] Format as X.XX%
- [ ] Show +/- sign
- [ ] Color code (green +, red -)
- [ ] Handle very small percentages

**File:** `src/utils/financial.ts::formatPercent()`

### 61. Data Validation
- [ ] Validate all user inputs
- [ ] Client-side validation (UX)
- [ ] Server-side validation (security)
- [ ] Type checking with TypeScript
- [ ] Show error messages
- [ ] Prevent invalid data submission

**File:** `src/utils/validation.ts`, API routes

### 62. Error Handling
- [ ] Try-catch blocks
- [ ] Error boundaries (React)
- [ ] Graceful fallbacks
- [ ] User-friendly messages
- [ ] Log errors (optional)
- [ ] Retry logic (optional)

**File:** `src/pages/_error.tsx`, components

### 63. Performance Monitoring (Optional)
- [ ] Measure Core Web Vitals
- [ ] Track FCP, LCP, CLS
- [ ] Monitor API response times
- [ ] Log slow operations
- [ ] Collect metrics

**File:** `src/utils/metrics.ts`

---

## Settings & Preferences

### 64. Settings Page
- [ ] Appearance (dark mode only, no need)
- [ ] Notifications (optional)
- [ ] Data privacy
- [ ] Export data (CSV)
- [ ] Account settings
- [ ] Delete account option

**File:** `src/pages/settings.tsx`

### 65. Notification Preferences (Optional)
- [ ] Price alerts
- [ ] Portfolio threshold alerts
- [ ] News alerts
- [ ] Email vs in-app
- [ ] Quiet hours

**File:** `src/pages/settings.tsx`

### 66. Export Portfolio (Optional)
- [ ] Export transactions to CSV
- [ ] Export portfolio metrics
- [ ] Export transactions PDF
- [ ] Generate yearly report

**File:** `src/utils/export.ts`

---

## Summary by Priority

### Phase 1 (MVP - Must Have)
1. Authentication (signup, login, logout)
2. Add buy/sell transactions
3. Dashboard with KPI badges
4. Holdings list
5. Portfolio metrics calculation
6. Basic price chart
7. Timeframe toggles
8. Chat terminal with MCP integration
9. Watchlist (add/remove/view)

### Phase 2 (High Priority)
10. Transaction history
11. Stock detail page
12. Advanced chart features (markers, caching)
13. Quick actions (buy/sell from detail)
14. Allocation breakdown chart
15. Recent transactions widget
16. Live price updates

### Phase 3 (Medium Priority)
17. Company info card
18. Rate limit management UI
19. Settings page
20. Message history persistence
21. Advanced search/filtering
22. Mobile optimization

### Phase 4 (Nice to Have)
23. Real-time streaming chat
24. Portfolio analytics
25. Email notifications
26. CSV export
27. Maverick MCP integration
28. OAuth authentication
29. Dark mode toggle (optional)

---

## Component Tree

```
App
├── Layout
│   ├── Navigation
│   ├── Main Content
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx
│   │   │   │   ├── signup.tsx
│   │   │   │   └── password-reset.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── transactions.tsx
│   │   │   ├── watchlist.tsx
│   │   │   ├── stock/[ticker].tsx
│   │   │   └── settings.tsx
│   │   └── components/
│   │       ├── KPIBadge.tsx
│   │       ├── HoldingsList.tsx
│   │       ├── AllocationChart.tsx
│   │       ├── PriceChart.tsx
│   │       ├── TimeframeToggle.tsx
│   │       ├── ChatTerminal.tsx
│   │       ├── TransactionForm.tsx
│   │       ├── WatchlistTable.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       └── [other components]
│   └── Footer (optional)
├── Providers
│   ├── Supabase (Auth + DB)
│   ├── MCP Servers (Agent Toolbelt, Maverick)
│   └── State Management (Zustand/Context)
└── Hooks
    ├── useAuth.ts
    ├── usePortfolio.ts
    ├── usePriceChart.ts
    ├── useWatchlist.ts
    ├── useToast.ts
    └── [other hooks]
```

---

## Estimated Effort

| Category | Features | Est. Hours |
|----------|----------|-----------|
| **Auth** | 5 | 8-12 |
| **Portfolio** | 10 | 15-20 |
| **Dashboard** | 7 | 12-16 |
| **Charts** | 5 | 10-15 |
| **Chat** | 12 | 20-25 |
| **Watchlist** | 4 | 6-8 |
| **Stock Detail** | 6 | 8-12 |
| **UI Components** | 14 | 25-30 |
| **Data/Perf** | 7 | 10-15 |
| **Settings** | 3 | 4-6 |
| **TOTAL** | **73** | **118-159 hours** |

**Realistic timeline with 2 hours/day: 2-2.5 months**

---

## Dependencies

### Already Installed
- ✅ Next.js 14
- ✅ React 18
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ shadcn/ui (Radix UI)
- ✅ Recharts
- ✅ Lucide icons
- ✅ Supabase (client)
- ✅ Decimal.js

### Need to Install
- ⚠️ `react-hot-toast` or similar (toast notifications)
- ⚠️ `zustand` or `jotai` (state management, optional)
- ⚠️ `swr` or `react-query` (data fetching, optional)

---

**Last Updated:** 2026-06-25  
**Version:** 1.0  
**Total Features:** 66
