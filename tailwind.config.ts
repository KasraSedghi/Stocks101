import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          base: '#07070A',
          panel: '#111116',
          surface: '#16161F',
        },
        cyber: '#1F1F2E',
        brand: { purple: '#8B5CF6' },
        neon: { green: '#10B981', red: '#EF4444' },
      },
    },
  },
};

export default config;
