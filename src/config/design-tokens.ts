/**
 * Design Tokens - Single Source of Truth for Design System
 * Colors, spacing, typography, animations, and responsive breakpoints
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const COLORS = {
  // Backgrounds
  dark: {
    base: '#07070A',      // Matte black - page background
    panel: '#0D0D12',     // Slightly lighter - card backgrounds
    surface: '#131320',   // Even lighter - hover states
    border: '#1F1F2E',    // Borders and dividers
  },

  // Brand Colors
  brand: {
    purple: '#8B5CF6',    // Cyber purple - primary
    purpleLight: '#A78BFA', // Lighter purple - hover
    purpleDark: '#6D28D9', // Darker purple - active
  },

  // Signal Colors
  neon: {
    green: '#10B981',     // Gains, positive indicators
    greenLight: '#34D399', // Hover
    greenDark: '#059669',  // Active
    red: '#EF4444',       // Losses, negative indicators
    redLight: '#F87171',  // Hover
    redDark: '#DC2626',   // Active
  },

  // Neutral
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  fontFamily: {
    sans: 'system-ui, -apple-system, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },

  fontSize: {
    xs: '0.75rem',        // 12px
    sm: '0.875rem',       // 14px
    base: '1rem',         // 16px
    lg: '1.125rem',       // 18px
    xl: '1.25rem',        // 20px
    '2xl': '1.5rem',      // 24px
    '3xl': '1.875rem',    // 30px
    '4xl': '2.25rem',     // 36px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Predefined text styles
  heading1: {
    size: '2.25rem',
    weight: 700,
    lineHeight: 1.2,
  },
  heading2: {
    size: '1.875rem',
    weight: 700,
    lineHeight: 1.2,
  },
  heading3: {
    size: '1.5rem',
    weight: 600,
    lineHeight: 1.3,
  },
  body: {
    size: '1rem',
    weight: 400,
    lineHeight: 1.5,
  },
  caption: {
    size: '0.875rem',
    weight: 500,
    lineHeight: 1.5,
  },
  code: {
    size: '0.875rem',
    weight: 400,
    lineHeight: 1.5,
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const SPACING = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
};

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  mobile: 320,      // min-width
  tablet: 768,      // min-width
  desktop: 1024,    // min-width
  wide: 1280,       // min-width
  ultrawide: 1920,  // min-width
};

export const MEDIA_QUERIES = {
  mobile: `(min-width: ${BREAKPOINTS.mobile}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  wide: `(min-width: ${BREAKPOINTS.wide}px)`,
  ultrawide: `(min-width: ${BREAKPOINTS.ultrawide}px)`,
};

// ============================================================================
// SHADOWS
// ============================================================================

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
  glow: `0 0 20px ${COLORS.brand.purple}40`, // Purple glow
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.375rem', // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  full: '9999px',
};

// ============================================================================
// ANIMATIONS & TRANSITIONS
// ============================================================================

export const TRANSITIONS = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  verySlow: '1000ms',
};

export const EASING = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const ANIMATIONS = {
  fadeIn: {
    duration: TRANSITIONS.normal,
    easing: EASING.easeIn,
  },
  slideIn: {
    duration: TRANSITIONS.normal,
    easing: EASING.easeOut,
  },
  pulse: {
    duration: TRANSITIONS.verySlow,
    easing: EASING.easeInOut,
  },
};

// ============================================================================
// COMPONENT SIZES
// ============================================================================

export const COMPONENT_SIZES = {
  // Button
  button: {
    sm: { height: '2rem', padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { height: '2.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { height: '3rem', padding: '1rem 2rem', fontSize: '1.125rem' },
  },

  // Input
  input: {
    height: '2.5rem',
    padding: '0.75rem 1rem',
    borderRadius: BORDER_RADIUS.md,
  },

  // Card
  card: {
    padding: SPACING[6],
    borderRadius: BORDER_RADIUS.lg,
    border: `1px solid ${COLORS.dark.border}`,
  },

  // Icon
  icon: {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
};

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  tooltip: 500,
  notification: 600,
};

// ============================================================================
// UTILITY: Get responsive style
// ============================================================================

export function getResponsiveStyle(
  mobile: string,
  tablet?: string,
  desktop?: string
): string {
  return `
    @media (min-width: ${BREAKPOINTS.mobile}px) { ${mobile} }
    ${tablet ? `@media (min-width: ${BREAKPOINTS.tablet}px) { ${tablet} }` : ''}
    ${desktop ? `@media (min-width: ${BREAKPOINTS.desktop}px) { ${desktop} }` : ''}
  `;
}
