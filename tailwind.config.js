/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      animation: {
        panQuoteLR: 'panQuoteLR 7s ease-in-out infinite', // 7s matches quote change interval
      },
      keyframes: {
        panQuoteLR: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '15%, 20%': { transform: 'translateX(0%)', opacity: '1' }, // Arrive and start pause
          '80%, 85%': { transform: 'translateX(0%)', opacity: '1' }, // End pause and start leaving
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
