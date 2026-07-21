import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Placeholder palette — swap for values from Carnivore_Club_Brand_Guidelines.docx
        charcoal: '#1c1a17',
        ember: '#b3491f',
        bone: '#f3ede3',
      },
    },
  },
  plugins: [],
};

export default config;
