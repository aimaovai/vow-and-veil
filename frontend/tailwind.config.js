/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 30px 80px rgba(48, 46, 44, 0.08)',
      },
    },
  },
  plugins: [],
};

