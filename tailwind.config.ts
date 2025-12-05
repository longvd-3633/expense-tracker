/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // Blue
        success: '#10B981', // Green for income
        danger: '#EF4444',  // Red for expense
        income: '#10B981',
        expense: '#EF4444',
      },
    },
  },
  plugins: [],
}
