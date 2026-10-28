/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06090e',
          900: '#0B0F19', // Main app background
          850: '#0F1626',
          800: '#151E33', // Cards & panels
          750: '#1B2642',
          700: '#223052', // Borders & dividers
          600: '#33446B',
        },
        brand: {
          blue: '#38BDF8',   // Electric Cyan
          indigo: '#6366F1', // Royal Indigo
          violet: '#8B5CF6', // Vibrant Violet
          purple: '#A855F7',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(56, 189, 248, 0.15)',
        'glow-md': '0 0 25px rgba(99, 102, 241, 0.2)',
        'glow-violet': '0 0 25px rgba(139, 92, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
