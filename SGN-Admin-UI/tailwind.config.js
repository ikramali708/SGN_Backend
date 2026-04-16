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
        /** Customer storefront only — admin/nursery keep `primary` */
        brand: {
          DEFAULT: '#2e7d32',
          light: '#81c784',
          surface: '#f5faf5',
          border: '#e8f5e9',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        shop: '0 4px 20px -4px rgba(46, 125, 50, 0.1)',
        'shop-hover': '0 10px 28px -6px rgba(46, 125, 50, 0.16)',
      },
      borderRadius: {
        shop: '12px',
      },
    },
  },
  plugins: [],
};
