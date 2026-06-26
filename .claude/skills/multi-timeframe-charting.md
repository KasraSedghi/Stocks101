---
name: Multi-Timeframe Charting
description: Render interactive price charts with time toggles, buy/sell markers, and performance optimization
context: ShadowVest dashboard and stock detail pages
---

# Multi-Timeframe Charting Skill

## Purpose
Display portfolio performance and stock prices across multiple timeframes (1D, 5D, 1M, 3M, 6M, 1Y, 3Y, Max) with smart caching, buy/sell transaction markers, and optimized rendering for large datasets.

## Core Responsibilities
1. **Time Toggle UI** — Switch between 1D, 5D, 1M, 3M, 6M, 1Y, 3Y, Max
2. **Data Caching** — Cache price history per timeframe (avoid redundant API calls)
3. **Transaction Markers** — Show buy/sell entry points on chart
4. **Color Coding** — Green for gains, red for losses, purple for flat
5. **Responsive Sizing** — Adapt to container width (desktop, tablet, mobile)
6. **Performance** — Use Canvas rendering for 1000+ data points

## Supported Timeframes

| Timeframe | Duration | Data Points | Interval | Cache TTL |
|-----------|----------|-------------|----------|-----------|
| **1D** | 1 day | ~390 | 1 minute | 300s |
| **5D** | 5 days | ~400 | 1 minute | 900s |
| **1M** | 1 month | ~21 | 1 day | 3600s |
| **3M** | 3 months | ~63 | 1 day | 3600s |
| **6M** | 6 months | ~126 | 1 day | 7200s |
| **1Y** | 1 year | ~252 | 1 day | 86400s |
| **3Y** | 3 years | ~756 | 1 day | 604800s |
| **Max** | All available | N/A | 1 day | 604800s |

## Implementation Rules

### Rule 1: Timeframe Hook
Create a custom hook to manage chart state and caching:

```typescript
function usePriceChart(ticker: string, initialTimeframe: TimeframeType = '1M') {
  const [timeframe, setTimeframe] = useState<TimeframeType>(initialTimeframe);
  const [data, setData] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Record<TimeframeType, PriceHistory[]>>({} as any);

  useEffect(() => {
    // Check cache first
    if (cacheRef.current[timeframe]) {
      setData(cacheRef.current[timeframe]);
      return;
    }

    // Fetch if not cached
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/price-history?ticker=${ticker}&timeframe=${timeframe}`);
        const priceData = await response.json();
        
        cacheRef.current[timeframe] = priceData;
        setData(priceData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, timeframe]);

  return { data, timeframe, setTimeframe, loading };
}
```

### Rule 2: Chart Component with Recharts
```typescript
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function PriceChart({ ticker, data, transactions }: Props) {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const gainColor = data[data.length - 1]?.close >= data[0]?.close 
    ? '#10B981'  // green
    : '#EF4444'; // red

  return (
    <div ref={containerRef} className="w-full h-96">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        width={containerWidth}
        height={384}
      >
        <defs>
          <linearGradient id="colorGain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gainColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={gainColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area 
          type="monotone" 
          dataKey="close" 
          stroke={gainColor} 
          fillOpacity={1} 
          fill="url(#colorGain)"
        />
        {/* Buy/Sell Markers (see Rule 3) */}
      </AreaChart>
    </div>
  );
}
```

### Rule 3: Transaction Markers on Chart
```typescript
function TransactionMarkers({ transactions, data }: Props) {
  return transactions.map((tx) => {
    // Find matching date on chart
    const point = data.find(d => 
      new Date(d.date).toDateString() === new Date(tx.transactionDate).toDateString()
    );

    if (!point) return null;

    const markerColor = tx.transactionType === 'BUY' ? '#8B5CF6' : '#10B981';
    const label = tx.transactionType === 'BUY' ? '↓' : '↑';

    return (
      <ReferenceDot
        key={tx.id}
        x={point.date}
        y={point.close}
        r={6}
        fill={markerColor}
        stroke="white"
        strokeWidth={2}
      >
        <Label value={label} position="top" fill={markerColor} />
      </ReferenceDot>
    );
  });
}
```

### Rule 4: Caching Strategy Per Timeframe
```typescript
const CACHE_CONFIG = {
  '1D': { ttl: 300, fetchInterval: 1 },      // 5 min, 1-min candles
  '5D': { ttl: 900, fetchInterval: 1 },      // 15 min, 1-min candles
  '1M': { ttl: 3600, fetchInterval: 1440 },  // 1 hour, daily candles
  '3M': { ttl: 3600, fetchInterval: 1440 },  // 1 hour, daily candles
  '6M': { ttl: 7200, fetchInterval: 1440 },  // 2 hours, daily candles
  '1Y': { ttl: 86400, fetchInterval: 1440 }, // 1 day, daily candles
  '3Y': { ttl: 604800, fetchInterval: 1440 },// 1 week, daily candles
  'MAX': { ttl: 604800, fetchInterval: 1440 }// 1 week, daily candles
};

function getCacheKey(ticker: string, timeframe: TimeframeType) {
  return `price_chart:${ticker}:${timeframe}`;
}

function isCacheValid(ticker: string, timeframe: TimeframeType): boolean {
  const key = getCacheKey(ticker, timeframe);
  const cached = localStorage.getItem(key);
  
  if (!cached) return false;
  
  const { timestamp } = JSON.parse(cached);
  const ttl = CACHE_CONFIG[timeframe].ttl;
  
  return Date.now() - timestamp < ttl * 1000;
}
```

### Rule 5: Canvas Rendering for Large Datasets
```typescript
function PriceChartOptimized({ data }: Props) {
  // For 1000+ points, use Canvas renderer (faster)
  if (data.length > 1000) {
    return (
      <AreaChart
        data={data}
        {...props}
      >
        {/* Use shape="monotone" with isAnimationActive={false} */}
        <Area
          isAnimationActive={false}
          shape="monotone"
          {...otherProps}
        />
      </AreaChart>
    );
  }

  // For smaller datasets, use SVG (smoother animations)
  return (
    <AreaChart data={data} {...props}>
      <Area isAnimationActive={true} {...otherProps} />
    </AreaChart>
  );
}
```

### Rule 6: Responsive Sizing with Debounce
```typescript
function useChartDimensions() {
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (containerRef.current) {
          setWidth(containerRef.current.clientWidth);
        }
      }, 200); // Debounce 200ms
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return { width, containerRef };
}
```

## Common Patterns

### Pattern 1: Portfolio vs Individual Stock Chart
```typescript
// Portfolio: show aggregate value over time
<PriceChart
  ticker="PORTFOLIO"
  data={portfolioValueHistory}
  transactions={allTransactions}
  timeframe={timeframe}
/>

// Individual: show stock price
<PriceChart
  ticker="AAPL"
  data={applePriceHistory}
  transactions={applTransactions}
  timeframe={timeframe}
/>
```

### Pattern 2: Prefetch Next Timeframe
```typescript
function TimeframeToggle({ currentTimeframe, onChange }: Props) {
  const prefetchNext = (next: TimeframeType) => {
    // Background fetch next timeframe
    // User clicks, data is already ready
    fetch(`/api/price-history?ticker=AAPL&timeframe=${next}`);
  };

  return (
    <div className="flex gap-2">
      {['1D', '5D', '1M', '3M', '6M', '1Y', '3Y', 'MAX'].map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf as TimeframeType)}
          onMouseEnter={() => prefetchNext(tf as TimeframeType)}
          className={currentTimeframe === tf ? 'active' : ''}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
```

### Pattern 3: Loading State with Skeleton
```typescript
function PriceChartWithLoading({ loading }: Props) {
  if (loading) {
    return (
      <div className="w-full h-96 bg-dark-surface animate-pulse rounded-lg" />
    );
  }

  return <PriceChart {...props} />;
}
```

## Color Scheme

```typescript
const CHART_COLORS = {
  gain: '#10B981',      // Neon green (+)
  loss: '#EF4444',      // Neon red (-)
  neutral: '#8B5CF6',   // Cyber purple (flat)
  buyMarker: '#8B5CF6', // Cyber purple (BUY)
  sellMarker: '#10B981',// Neon green (SELL)
  grid: '#333333',      // Dark grid
  text: '#E5E7EB'       // Light text
};
```

## Guardrails

- ✅ **Always check cache before fetching** (saves API quota)
- ✅ **Debounce resize listeners** (prevents excessive re-renders)
- ✅ **Use Canvas for 1000+ points** (prevents lag)
- ✅ **Color coding must be consistent** (green = gain, red = loss)
- ✅ **Mobile viewport must show all timeframes** (scroll if needed)
- ✅ **Prefetch next timeframe** (seamless UX)

## Testing Checklist

When implementing charting:
- [ ] Time toggle switches correctly
- [ ] Chart data cached (no duplicate API calls)
- [ ] Cache expires at correct TTL
- [ ] Transaction markers appear on correct dates
- [ ] Color changes based on gain/loss
- [ ] Responsive to window resize
- [ ] Debounce prevents excessive redraws
- [ ] Large datasets (1000+ points) render smoothly
- [ ] Mobile layout shows all timeframes

## Files to Reference
- `src/components/PriceChart.tsx` — Main chart component (to create)
- `src/hooks/usePriceChart.ts` — Chart data hook (to create)
- `src/utils/financial.ts` — Price aggregation logic
- `tailwind.config.ts` — Color scheme
