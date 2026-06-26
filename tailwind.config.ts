import type { Config } from 'tailwindcss';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TRANSITIONS } from './src/config/design-tokens';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          base: COLORS.dark.base,
          panel: COLORS.dark.panel,
          surface: COLORS.dark.surface,
          border: COLORS.dark.border,
        },
        brand: {
          purple: COLORS.brand.purple,
          'purple-light': COLORS.brand.purpleLight,
          'purple-dark': COLORS.brand.purpleDark,
        },
        neon: {
          green: COLORS.neon.green,
          'green-light': COLORS.neon.greenLight,
          'green-dark': COLORS.neon.greenDark,
          red: COLORS.neon.red,
          'red-light': COLORS.neon.redLight,
          'red-dark': COLORS.neon.redDark,
        },
        gray: {
          50: COLORS.gray[50],
          100: COLORS.gray[100],
          200: COLORS.gray[200],
          300: COLORS.gray[300],
          400: COLORS.gray[400],
          500: COLORS.gray[500],
          600: COLORS.gray[600],
          700: COLORS.gray[700],
          800: COLORS.gray[800],
          900: COLORS.gray[900],
        },
        success: COLORS.success,
        warning: COLORS.warning,
        error: COLORS.error,
        info: COLORS.info,
      },
      spacing: {
        0: SPACING[0],
        1: SPACING[1],
        2: SPACING[2],
        3: SPACING[3],
        4: SPACING[4],
        6: SPACING[6],
        8: SPACING[8],
        12: SPACING[12],
        16: SPACING[16],
        20: SPACING[20],
        24: SPACING[24],
      },
      borderRadius: {
        none: BORDER_RADIUS.none,
        sm: BORDER_RADIUS.sm,
        base: BORDER_RADIUS.base,
        md: BORDER_RADIUS.md,
        lg: BORDER_RADIUS.lg,
        xl: BORDER_RADIUS.xl,
        full: BORDER_RADIUS.full,
      },
      boxShadow: {
        none: SHADOWS.none,
        sm: SHADOWS.sm,
        base: SHADOWS.base,
        md: SHADOWS.md,
        lg: SHADOWS.lg,
        xl: SHADOWS.xl,
        glow: SHADOWS.glow,
      },
      transitionDuration: {
        fast: TRANSITIONS.fast,
        normal: TRANSITIONS.normal,
        slow: TRANSITIONS.slow,
        'very-slow': TRANSITIONS.verySlow,
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
