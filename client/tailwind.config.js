/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          dark: '#050816',
        },
        surface: {
          light: '#f5f7fb',
          dark: '#111827',
        },
      },
    },
  },
  plugins: [],
};
