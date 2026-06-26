/**
 * Centralized route configuration
 * All redirects and navigation paths defined here
 * Update this file to change app routes globally
 */

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

  // Stock detail
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
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Get redirect URL based on authentication state
 */
export function getDefaultRedirect(authenticated: boolean): string {
  return authenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN;
}

/**
 * Check if route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    ROUTES.DASHBOARD,
    ROUTES.TRANSACTIONS,
    ROUTES.WATCHLIST,
    ROUTES.SETTINGS,
  ];
  return protectedRoutes.some(route => pathname.startsWith(route));
}
