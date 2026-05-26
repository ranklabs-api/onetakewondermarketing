/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#D63384',
          'pink-dark': '#A61E63',
          'pink-light': '#F8D0E4',
          'pink-mid': '#E86BA8',
        },
        surface: {
          light: '#F9FAFB',
          DEFAULT: '#F3F4F6',
          dark: '#E5E7EB',
        },
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};