import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: 'var(--void)',
        hull: 'var(--hull)',
        panel: 'var(--panel)',
        edge: 'var(--edge)',
        ice: 'var(--ice)',
        mist: 'var(--mist)',
        faro: 'var(--faro)',
        'faro-deep': 'var(--faro-deep)',
        flujo: 'var(--flujo)',
        ok: 'var(--ok)',
        'on-amber': 'var(--on-amber)',
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
