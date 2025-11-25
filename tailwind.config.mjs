/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Cairo", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // primary mid
          600: '#7c3aed', // primary
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95'
        },
        accent: {
          500: '#ec4899',
          600: '#db2777'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg,#7c3aed,#8b5cf6 40%,#ec4899 80%)',
        'gradient-radial': 'radial-gradient(circle at 30% 30%, #8b5cf6, #4c1d95 70%)'
      },
      boxShadow: {
        glow: '0 0 0 3px rgba(124,58,237,0.35)',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease forwards',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } }
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
