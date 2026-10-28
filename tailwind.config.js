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
          canvas: "#F6F5F1",
          surface: "#FFFFFF",
          surfaceMuted: "#ECEAE3",
          ink: "#111318",
          muted: "#525866",
          border: "#E2DFD7",
          borderDark: "#C5C1B6",
          accent: "#1D4ED8",
          accentHover: "#1E40AF",
          discrepancy: "#C2410C",
          discrepancyBg: "#FEF2F2",
          verified: "#15803D",
          verifiedBg: "#EDF7EE",
          warning: "#B45309",
          warningBg: "#FFFBEB",
        }
      },
      borderRadius: {
        'status': '2px',
        'btn': '3px',
        'input': '3px',
        'card': '4px',
        'preview': '6px',
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          'Menlo',
          'monospace'
        ]
      },
      boxShadow: {
        'datum': '0 1px 2px 0 rgba(17, 19, 24, 0.04)',
        'datum-lg': '0 4px 16px -2px rgba(17, 19, 24, 0.06), 0 1px 3px 0 rgba(17, 19, 24, 0.03)',
      }
    },
  },
  plugins: [],
}
