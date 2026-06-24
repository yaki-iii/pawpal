import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF8C42',
          light: '#FFAB73',
          dark: '#E6701F',
        },
        secondary: {
          DEFAULT: '#4ECDC4',
          light: '#7FE0D8',
          dark: '#3BB3A9',
        },
        warm: {
          50: '#FFF8F3',
          100: '#FFF0E6',
          200: '#FFE0CC',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
