/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        indian: {
          badge: '#ea580c', // rich saffron/orange
          bg: '#fff7ed',
          border: '#fed7aa',
        },
        american: {
          badge: '#2563eb', // royal blue
          bg: '#eff6ff',
          border: '#bfdbfe',
        },
        costco: {
          badge: '#dc2626', // signature red
          bg: '#fef2f2',
          border: '#fecaca',
        }
      },
      screens: {
        'xs': '420px',
      }
    },
  },
  plugins: [],
}
