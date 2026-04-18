/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          sun: '#E8A838',
          moon: '#4A90D9',
          dark: '#0F1117',
          card: '#1A1F2E',
        }
      }
    }
  },
  plugins: [],
}
