/**
 * Model Context Protocol (MCP) Server Configuration
 * Centralized settings for all MCP providers and tools
 */

export type MCPProvider = 'agent-toolbelt' | 'maverick' | 'supabase' | 'github' | 'local';

export interface MCPServerConfig {
  name: string;
  provider: MCPProvider;
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  timeout: number; // milliseconds
  rateLimit?: {
    requestsPerMonth?: number;
    requestsPerMinute?: number;
  };
  cacheTTL: Record<string, number>; // seconds
}

/**
 * MCP Server Configurations
 */
export const MCP_SERVERS: Record<MCPProvider, MCPServerConfig> = {
  'agent-toolbelt': {
    name: 'Agent Toolbelt',
    provider: 'agent-toolbelt',
    enabled: !!process.env.AGENT_TOOLBELT_API_KEY,
    endpoint: 'https://api.agenttoolbelt.live',
    apiKey: process.env.AGENT_TOOLBELT_API_KEY,
    timeout: 10000,
    rateLimit: {
      requestsPerMonth: 250,
      requestsPerMinute: 10,
    },
    cacheTTL: {
      stock_thesis: 3600,
      earnings_analysis: 86400,
      insider_signal: 3600,
      valuation_snapshot: 300,
      bear_vs_bull: 3600,
    },
  },

  'maverick': {
    name: 'Maverick MCP',
    provider: 'maverick',
    enabled: !!process.env.MAVERICK_MCP_URL,
    endpoint: process.env.MAVERICK_MCP_URL,
    timeout: 15000,
    rateLimit: {
      requestsPerMonth: undefined, // unlimited on local
    },
    cacheTTL: {
      price: 300,
      indicators: 3600,
      backtesting: 7200,
    },
  },

  'supabase': {
    name: 'Supabase',
    provider: 'supabase',
    enabled: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    endpoint: process.env.NEXT_PUBLIC_SUPABASE_URL,
    apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    timeout: 5000,
    cacheTTL: {
      transactions: 0, // don't cache (real-time)
      watchlists: 0,
      user_session: 1800,
    },
  },

  'github': {
    name: 'GitHub',
    provider: 'github',
    enabled: !!process.env.GITHUB_TOKEN,
    endpoint: 'https://api.github.com',
    apiKey: process.env.GITHUB_TOKEN,
    timeout: 10000,
    cacheTTL: {
      user: 3600,
      repos: 3600,
    },
  },

  'local': {
    name: 'Local Development',
    provider: 'local',
    enabled: process.env.NODE_ENV === 'development',
    endpoint: 'http://localhost:3000',
    timeout: 5000,
    cacheTTL: {
      mock_data: 60,
    },
  },
};

/**
 * Get enabled MCP servers
 */
export function getEnabledServers(): MCPServerConfig[] {
  return Object.values(MCP_SERVERS).filter(server => server.enabled);
}

/**
 * Get server configuration by provider
 */
export function getServerConfig(provider: MCPProvider): MCPServerConfig | null {
  return MCP_SERVERS[provider] || null;
}

/**
 * Check if MCP provider is available
 */
export function isMCPAvailable(provider: MCPProvider): boolean {
  const config = getServerConfig(provider);
  return config?.enabled ?? false;
}

/**
 * Get cache TTL for a specific tool
 */
export function getCacheTTL(provider: MCPProvider, tool: string): number {
  const config = getServerConfig(provider);
  return config?.cacheTTL[tool] ?? 300; // default 5 min
}

/**
 * MCP Tool Definitions
 */
export const MCP_TOOLS = {
  // Agent Toolbelt Tools
  stock_thesis: {
    provider: 'agent-toolbelt' as const,
    description: 'Get fundamental analysis and investment thesis for a stock',
    cacheTTL: 3600,
  },
  earnings_analysis: {
    provider: 'agent-toolbelt' as const,
    description: 'Analyze quarterly earnings reports and guidance',
    cacheTTL: 86400,
  },
  insider_signal: {
    provider: 'agent-toolbelt' as const,
    description: 'Track insider trading activity and signals',
    cacheTTL: 3600,
  },
  valuation_snapshot: {
    provider: 'agent-toolbelt' as const,
    description: 'Get current valuation metrics (P/E, P/B, etc)',
    cacheTTL: 300,
  },
  bear_vs_bull: {
    provider: 'agent-toolbelt' as const,
    description: 'Get bull and bear case arguments for a stock',
    cacheTTL: 3600,
  },

  // Maverick Tools
  price_history: {
    provider: 'maverick' as const,
    description: 'Get historical price data and candlesticks',
    cacheTTL: 300,
  },
  technical_indicators: {
    provider: 'maverick' as const,
    description: 'Calculate RSI, MACD, Bollinger Bands, etc',
    cacheTTL: 3600,
  },
  backtesting: {
    provider: 'maverick' as const,
    description: 'Run backtest on trading strategies',
    cacheTTL: 7200,
  },

  // Supabase Tools
  get_transactions: {
    provider: 'supabase' as const,
    description: 'Fetch user transactions from database',
    cacheTTL: 0,
  },
  create_transaction: {
    provider: 'supabase' as const,
    description: 'Record a new buy/sell transaction',
    cacheTTL: 0,
  },
  get_watchlist: {
    provider: 'supabase' as const,
    description: 'Fetch user watchlist',
    cacheTTL: 0,
  },
} as const;

export type MCPToolName = keyof typeof MCP_TOOLS;

/**
 * Get tool definition
 */
export function getToolDefinition(tool: MCPToolName) {
  return MCP_TOOLS[tool];
}

/**
 * Get provider for a tool
 */
export function getToolProvider(tool: MCPToolName): MCPProvider | null {
  const definition = getToolDefinition(tool);
  return definition?.provider ?? null;
}
