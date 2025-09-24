/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Ensure custom CSS layers work properly
  corePlugins: {
    preflight: true, // Keep Tailwind's base styles
  },
}
