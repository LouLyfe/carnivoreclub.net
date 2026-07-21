import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // "Butcher's Reserve" — Carnivore Club Brand Guidelines v1, Section 2.1
        oxblood: '#5C1A1A', // primary brand colour — headings, CTAs, key accents
        charcoal: '#1C1B19', // text, dark backgrounds, footer
        gold: '#B08D57', // approval badges, tier tags, premium accents — trust signal, use sparingly
        bone: '#EFE7DA', // page background, card surfaces
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
