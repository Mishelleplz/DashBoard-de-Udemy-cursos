/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        udemy: {
          bg: '#0b0f1a',
          panel: '#121828',
          border: '#1f2a44',
          accent: '#a435f0',
          accent2: '#22d3ee',
        },
      },
    },
  },
  plugins: [],
}
