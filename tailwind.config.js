/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        sky: { DEFAULT: '#0ea5e9', 400: '#38bdf8', 500: '#0ea5e9' },
      }
    },
  },
  plugins: [],
}
