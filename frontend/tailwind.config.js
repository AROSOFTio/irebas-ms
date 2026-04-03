/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primeBlue: '#1455c6',
        primeBlueHover: '#0f44a3',
        accentRed: '#b12917',
        accentRedHover: '#8c2012',
        lightBlueBg: '#eef3fb'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
