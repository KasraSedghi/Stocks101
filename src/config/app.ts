export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  agentToolbeltUrl: process.env.AGENT_TOOLBELT_URL || 'https://agenttoolbelt.live',
  maverickUrl: process.env.MAVERICK_MCP_URL || 'http://localhost:5000',
  priceRefreshInterval: 5 * 60 * 1000, // 5 minutes
  agentToolbeltMonthlyLimit: 250,
};
