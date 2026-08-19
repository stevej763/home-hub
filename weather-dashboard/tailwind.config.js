/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        panel: {
          DEFAULT: '#15191C',
          raised: '#1B2124',
          line: '#2A3236',
        },
        face: {
          DEFAULT: '#F2ECDD',
          dim: '#E7DFC9',
        },
        ink: {
          DEFAULT: '#201C14',
          soft: '#4A4536',
        },
        brass: {
          DEFAULT: '#B8863A',
          light: '#D4A45E',
          dark: '#8C6425',
        },
        teal: {
          DEFAULT: '#2F6E68',
          light: '#4A928A',
        },
        slate: {
          DEFAULT: '#5B6B72',
          light: '#7C8B92',
        },
        rust: {
          DEFAULT: '#B8503A',
          light: '#D06F58',
        },
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'sans-serif'],
        body: ['"IBM Plex Serif"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        face: '0 1px 1px rgba(0,0,0,0.5), 0 12px 28px -14px rgba(0,0,0,0.65)',
        rivet: 'inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.4)',
      },
      keyframes: {
        pulseLamp: {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.6, filter: 'brightness(1.4)' },
        },
        rise: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        lamp: 'pulseLamp 2.2s ease-in-out infinite',
        rise: 'rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
