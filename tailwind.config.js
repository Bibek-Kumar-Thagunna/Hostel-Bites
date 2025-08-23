/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(251, 191, 36, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(251, 191, 36, 0.1) 1px, transparent 1px)",
      },
      backgroundSize: {
         'grid-size': '20px 20px',
      }
    },
  },
  plugins: [],
}