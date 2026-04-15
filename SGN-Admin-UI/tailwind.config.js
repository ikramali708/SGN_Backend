/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#14532d',
          dark: '#052e16',
          light: '#166534',
        },
        secondary: {
          DEFAULT: '#86efac',
          dark: '#4ade80',
        },
        surface: '#f1f5f9',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
