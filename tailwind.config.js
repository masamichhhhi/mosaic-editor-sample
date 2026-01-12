/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'editor-bg': '#0f0f0f',
        'editor-secondary': '#1a1a1a',
        'editor-accent': '#6366f1',
        'editor-accent-hover': '#818cf8',
        'editor-text': '#f5f5f5',
        'editor-text-secondary': '#a3a3a3',
        'mosaic-highlight': '#22c55e',
        'timeline-bg': '#262626',
      },
    },
  },
  plugins: [],
}
