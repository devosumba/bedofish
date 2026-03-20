import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0D1F4E', deep: '#06101F', mid: '#1A3C8F' },
        orange: { DEFAULT: '#F4911E', dark: '#D97A0A', light: '#FFF0E0' },
        brand: { green: '#1B7A4F', 'green-light': '#EAF7EF' },
        gray: { 100: '#F8F7F3', 200: '#EDEAE3', 400: '#999999', 600: '#555555' },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config
