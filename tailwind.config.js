/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FFFFFF",
          surface: "#F7F8F6",
          text: "#202722",
          muted: "#626B64",
          accent: "#176B50",
          accentHover: "#12563F",
          border: "#E2E6E1",
          verified: "#EDF4EF",
          error: "#A33A32",
        }
      },
      borderRadius: {
        'status': '3px',
        'btn': '4px',
        'input': '4px',
        'card': '6px',
        'preview': '8px',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'preview': '0 4px 12px 0 rgba(32, 39, 34, 0.05), 0 1px 2px 0 rgba(32, 39, 34, 0.03)',
      }
    },
  },
  plugins: [],
}
