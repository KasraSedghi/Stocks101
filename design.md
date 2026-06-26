# ShadowVest Design System

Comprehensive design specifications for the personal finance stock portfolio tracker. All design tokens, component styles, and layout patterns are defined here.

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Route Configuration](#route-configuration)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Layout & Spacing](#layout--spacing)
6. [Components](#components)
7. [Responsive Behavior](#responsive-behavior)
8. [Animations & Interactions](#animations--interactions)
9. [Accessibility](#accessibility)

---

## Design Tokens

All design values are centralized in `src/config/design-tokens.ts`. This ensures consistency across the entire application and makes global design changes trivial.

### Why Design Tokens?

Instead of hardcoding colors, spacing, and sizes throughout components, we import from design tokens:

```typescript
// ❌ BAD - Hardcoded values scattered
<div style={{ color: '#8B5CF6', padding: '1rem', borderRadius: '8px' }}>

// ✅ GOOD - Import from tokens
import { COLORS, SPACING, BORDER_RADIUS } from '@/config/design-tokens';
<div style={{ 
  color: COLORS.brand.purple, 
  padding: SPACING[4], 
  borderRadius: BORDER_RADIUS.md 
}}>
```

### Benefits

- **Single Source of Truth** — Change a color in one place, update everywhere
- **Consistency** — All components use the same palette
- **Maintenance** — Global redesign takes minutes, not days
- **Developer Experience** — Type-safe color/spacing suggestions

---

## Route Configuration

All application routes are centralized in `src/config/routes.ts`. This prevents hardcoded paths throughout the codebase.

### Why Centralized Routes?

Instead of `router.push('/dashboard')` scattered throughout components, use the route config:

```typescript
// ❌ BAD - Hardcoded paths
router.push('/dashboard');
redirect('/login');
router.push(`/stock/${ticker}`);

// ✅ GOOD - Centralized config
import { ROUTES } from '@/config/routes';
router.push(ROUTES.DASHBOARD);
redirect(ROUTES.LOGIN);
router.push(ROUTES.STOCK_DETAIL(ticker));
```

### Route Types

```typescript
export const ROUTES = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  PASSWORD_RESET: '/auth/password-reset',
  AUTH_CALLBACK: '/api/auth/callback',

  // Main app
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  WATCHLIST: '/watchlist',
  SETTINGS: '/settings',

  // Stock detail (dynamic)
  STOCK_DETAIL: (ticker: string) => `/stock/${ticker}`,

  // API routes
  API_MCP_AGENT_TOOLBELT: '/api/mcp/agent-toolbelt',
  API_MCP_MAVERICK: '/api/mcp/maverick',
  API_MCP_STATUS: '/api/mcp/status',
  API_CHAT: '/api/chat',
  API_AUTH_LOGOUT: '/api/auth/logout',

  // Error pages
  NOT_FOUND: '/404',
  ERROR: '/error',
};
```

### Protected Routes Helper

```typescript
import { isProtectedRoute } from '@/config/routes';

if (isProtectedRoute(pathname) && !authenticated) {
  redirect(ROUTES.LOGIN);
}
```

---

## Color System

### Primary Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Dark Base** | `#07070A` | Page background |
| **Dark Panel** | `#0D0D12` | Card backgrounds |
| **Dark Surface** | `#131320` | Hover/active states |
| **Brand Purple** | `#8B5CF6` | Primary buttons, accents |
| **Neon Green** | `#10B981` | Gains, success states |
| **Neon Red** | `#EF4444` | Losses, error states |

### Color Usage Guidelines

```typescript
import { COLORS } from '@/config/design-tokens';

// Backgrounds
backgroundColor: COLORS.dark.base          // Page background
backgroundColor: COLORS.dark.panel         // Cards, panels
backgroundColor: COLORS.dark.surface       // Hover states

// Text
color: COLORS.gray[200]                    // Primary text
color: COLORS.gray[400]                    // Secondary text
color: COLORS.gray[600]                    // Disabled text

// Semantic
color: COLORS.neon.green                   // Portfolio gains
color: COLORS.neon.red                     // Portfolio losses
backgroundColor: COLORS.brand.purple       // Primary button
backgroundColor: COLORS.brand.purpleDark   // Button:active
```

### Dark Theme Only

ShadowVest uses **dark theme only** (no light mode):
- Reduces eye strain during market hours
- Premium, modern aesthetic
- Consistent with trader/financial apps
- Easier WCAG contrast ratios with neon colors

### Color Contrast

All color combinations meet **WCAG 2.1 AA** minimum (4.5:1 for text):

```
Text on Dark Base:
✅ Gray 200 on #07070A (ratio: 12.5:1)
✅ Brand Purple on #07070A (ratio: 5.2:1)
❌ Gray 400 on #07070A (ratio: 2.8:1) — use only for secondary text
```

---

## Typography

### Font Stack

```typescript
import { TYPOGRAPHY } from '@/config/design-tokens';

fontFamily: TYPOGRAPHY.fontFamily.sans  // System fonts (fast)
fontFamily: TYPOGRAPHY.fontFamily.mono  // Code/numbers
```

**Sans:** `system-ui, -apple-system, sans-serif` (no web fonts = faster)  
**Mono:** `'Fira Code', 'Courier New', monospace` (fallback to system mono)

### Type Hierarchy

```typescript
// Heading 1 (Page title)
fontSize: '2.25rem' (36px)
fontWeight: 700
lineHeight: 1.2

// Heading 2 (Section title)
fontSize: '1.875rem' (30px)
fontWeight: 700
lineHeight: 1.2

// Heading 3 (Card title)
fontSize: '1.5rem' (24px)
fontWeight: 600
lineHeight: 1.3

// Body (Default text)
fontSize: '1rem' (16px)
fontWeight: 400
lineHeight: 1.5

// Caption (Small text, labels)
fontSize: '0.875rem' (14px)
fontWeight: 500
lineHeight: 1.5

// Code (Numbers, symbols)
fontSize: '0.875rem' (14px)
fontWeight: 400
fontFamily: monospace
lineHeight: 1.5
```

### Usage Example

```typescript
import { TYPOGRAPHY } from '@/config/design-tokens';

// Use predefined text styles
<h1 style={{
  fontSize: TYPOGRAPHY.heading1.size,
  fontWeight: TYPOGRAPHY.heading1.weight,
  lineHeight: TYPOGRAPHY.heading1.lineHeight,
}}>
  Portfolio Value
</h1>
```

---

## Layout & Spacing

### Spacing Scale

```typescript
import { SPACING } from '@/config/design-tokens';

// Use multiples of 4px (4, 8, 12, 16, 24, 32, 48...)
margin: SPACING[4]        // 16px
padding: SPACING[6]       // 24px
gap: SPACING[2]           // 8px
borderRadius: SPACING[1]  // 4px
```

### 3-Column Dashboard Layout

```typescript
// Desktop: 3 columns (portfolio | chart | chat)
// Tablet: 2 columns (portfolio + chart | chat)
// Mobile: 1 column (stacked)

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Portfolio />     {/* Left: Holdings list */}
  <Chart />         {/* Center: Price chart */}
  <ChatTerminal />  {/* Right: AI chat */}
</div>
```

### Component Sizing

```typescript
import { COMPONENT_SIZES } from '@/config/design-tokens';

// Button
height: COMPONENT_SIZES.button.md.height         // 2.5rem
padding: COMPONENT_SIZES.button.md.padding       // 0.75rem 1.5rem

// Input Field
height: COMPONENT_SIZES.input.height             // 2.5rem
borderRadius: COMPONENT_SIZES.input.borderRadius // 0.5rem

// Card
padding: COMPONENT_SIZES.card.padding            // 1.5rem
borderRadius: COMPONENT_SIZES.card.borderRadius  // 0.75rem
```

---

## Components

### KPI Badges (Portfolio Metrics)

Display key performance indicators at the top of dashboard.

```typescript
interface KPIBadge {
  label: string;
  value: string;
  change?: number;    // +5.2 or -2.1
  icon?: ReactNode;
  color?: 'gain' | 'loss' | 'neutral';
}

// Example
<KPIBadge
  label="Net Worth"
  value="$45,230.50"
  change={+8.5}
  color="gain"
/>
```

**Design:**
- Background: `COLORS.dark.panel`
- Border: `1px solid COLORS.dark.border`
- Text: Primary (gray 200), secondary (gray 400)
- Change color: Green if positive, red if negative

### Price Chart

Interactive Recharts area chart with time toggles.

```typescript
interface PriceChartProps {
  ticker: string;
  data: PriceHistory[];
  timeframe: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '3Y' | 'MAX';
  onTimeframeChange: (tf: TimeframeType) => void;
  transactions?: Transaction[];
}
```

**Design:**
- Background: `COLORS.dark.panel`
- Line color: Green if gains, red if losses
- Grid: Subtle (`COLORS.dark.border`)
- Timeframe buttons: Toggle between predefined ranges
- Buy/sell markers: Purple and green circles on chart
- Responsive: Full width on mobile, fixed width on desktop

### Transaction Form

Form for adding buy/sell transactions.

```typescript
interface TransactionFormProps {
  ticker: string;
  onSubmit: (transaction: Transaction) => void;
  currentPrice?: number;
  shareholdings?: number;
}
```

**Fields:**
- Ticker (auto-filled, editable)
- Type (BUY / SELL radio)
- Shares (decimal input, 1-10,000)
- Price per Share (decimal input, $0.01-$9,999.99)
- Date (date picker, default today)

**Design:**
- Layout: Vertical stack on mobile, 2 columns on desktop
- Label: `COLORS.gray[400]`, font-size: `0.875rem`
- Input: `COMPONENT_SIZES.input`
- Button: Primary (purple), full width on mobile

### Chat Terminal

Terminal-style AI chat interface.

```typescript
interface ChatTerminalProps {
  messages: ChatMessage[];
  loading: boolean;
  onSendMessage: (message: string) => void;
}
```

**Design:**
- Background: `COLORS.dark.base` (darkest)
- Border: Top and left borders in `COLORS.brand.purple`
- Input field: At bottom, full width
- Messages: Alternating user (right, gray bg) and assistant (left, transparent)
- Code blocks: Monospace font, darker background
- Scrollable: Max height 600px, scroll on overflow

### Watchlist Table

Simple two-column table: Ticker | Price

```typescript
interface WatchlistTableProps {
  tickers: Watchlist[];
  onRemove: (ticker: string) => void;
}
```

**Design:**
- No header row
- Rows: Alternating background (none, dark.surface)
- Hover: Background darkens, cursor pointer
- Delete icon: Red on hover
- Responsive: Single column on mobile (ticker below price)

---

## Responsive Behavior

### Breakpoints

```typescript
import { BREAKPOINTS } from '@/config/design-tokens';

Mobile:    320px
Tablet:    768px
Desktop:  1024px
Wide:    1280px
```

### Mobile-First Approach

Start with mobile styles, enhance for larger screens:

```typescript
// Mobile: 1 column, full width
<div className="grid grid-cols-1 gap-4">

// Tablet: 2 columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Desktop: 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Touch-Friendly Targets

All clickable elements must be at least **44×44px** (11.6mm square):

```typescript
// Button
height: '2.5rem'  // 40px (too small)
height: '3rem'    // 48px ✅ (touch-friendly)

// Icon button
width: '2.5rem', height: '2.5rem'  // ✅
```

---

## Animations & Interactions

### Transitions

```typescript
import { TRANSITIONS, EASING } from '@/config/design-tokens';

// Fade in/out
transition: `opacity ${TRANSITIONS.normal} ${EASING.easeInOut}`

// Slide in
transition: `transform ${TRANSITIONS.normal} ${EASING.easeOut}`

// Pulse (loading)
animation: `pulse ${TRANSITIONS.verySlow} ${EASING.easeInOut} infinite`
```

### Duration Guidelines

| Duration | Use Case |
|----------|----------|
| **150ms** | Hover effects, button press |
| **300ms** | Modal open, page transition |
| **500ms** | Loading indicator, long scroll |
| **1000ms** | Pulse animations, background effects |

### Hover States

All interactive elements must have hover feedback:

```typescript
// Button
backgroundColor: COLORS.brand.purple           // default
backgroundColor: COLORS.brand.purpleLight      // hover
backgroundColor: COLORS.brand.purpleDark       // active

// Link
color: COLORS.brand.purple
textDecoration: 'underline'                    // hover
```

### Loading States

Use spinner or skeleton:

```typescript
// Spinner
<div className="animate-spin">
  <svg>...</svg>
</div>

// Skeleton
<div className="animate-pulse bg-dark-surface rounded h-12 w-full" />
```

---

## Accessibility

### WCAG 2.1 AA Compliance

All interfaces must meet Web Content Accessibility Guidelines Level AA:

- **Color Contrast:** 4.5:1 for text, 3:1 for graphics
- **Touch Targets:** Minimum 44×44px
- **Keyboard Navigation:** All interactive elements accessible via Tab
- **Semantic HTML:** Proper heading hierarchy, ARIA labels

### Color Alone Not Sufficient

Never rely only on color to convey information:

```typescript
// ❌ BAD - Color only
<div style={{ color: COLORS.neon.green }}>Gain</div>

// ✅ GOOD - Icon + color + text
<div style={{ color: COLORS.neon.green }}>
  <TrendingUpIcon /> Gain (+$500)
</div>
```

### Focus Indicators

All interactive elements must show clear focus state:

```typescript
// Button focus ring (purple)
outline: `2px solid ${COLORS.brand.purple}`
outlineOffset: '2px'
```

### Motion Preferences

Respect `prefers-reduced-motion`:

```typescript
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint (FCP)** | < 1.2s | Google Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Core Web Vitals |
| **Cumulative Layout Shift (CLS)** | < 0.1 | No jank |
| **Time to Interactive (TTI)** | < 3s | Interactive |
| **Bundle Size** | < 200KB | Gzipped |

---

## Dark Mode Only

ShadowVest uses **dark theme exclusively**. No light mode support.

### Why Dark Only?

1. **Brand Identity** — Matches cyberpunk aesthetic
2. **Eye Strain** — Easier on eyes during market hours
3. **Performance** — One theme = less CSS
4. **Simplicity** — No theme toggle complexity

### Dark Theme Advantages

- Neon colors pop against dark backgrounds
- Reduced OLED burn-in with pure blacks
- Modern, premium appearance
- Native to financial/crypto apps (Bloomberg, etc.)

---

## Implementation Checklist

- [ ] All colors imported from `COLORS` token
- [ ] All spacing uses `SPACING` scale (4px multiples)
- [ ] All routes use `ROUTES` config
- [ ] All fonts use `TYPOGRAPHY` definitions
- [ ] All animations use `TRANSITIONS` and `EASING`
- [ ] Responsive breakpoints use `BREAKPOINTS`
- [ ] Touch targets at least 44×44px
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators visible on all interactive elements
- [ ] Tested on mobile, tablet, desktop

---

## Quick Reference

```typescript
// Import tokens
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/config/design-tokens';
import { ROUTES } from '@/config/routes';

// Use in component
<button style={{
  backgroundColor: COLORS.brand.purple,
  padding: SPACING[4],
  borderRadius: BORDER_RADIUS.md,
  fontSize: TYPOGRAPHY.fontSize.base,
  fontWeight: TYPOGRAPHY.fontWeight.medium,
  cursor: 'pointer',
  transition: `background-color 150ms ease-out`,
}} onClick={() => router.push(ROUTES.DASHBOARD)}>
  Go to Dashboard
</button>
```

---

**Last Updated:** 2026-06-25  
**Version:** 1.0  
**Author:** ShadowVest Design System
