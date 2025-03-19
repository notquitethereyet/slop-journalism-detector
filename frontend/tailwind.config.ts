import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tokyo-bg': '#1a1b26',
        'tokyo-bg-darker': '#16161e',
        'tokyo-bg-lighter': '#24283b',
        'tokyo-fg': '#a9b1d6',
        'tokyo-fg-dark': '#565f89',
        'tokyo-fg-light': '#c0caf5',
        'tokyo-border': '#414868',
        'tokyo-comment': '#565f89',
        'tokyo-selection': '#28344a',
        'tokyo-terminal-black': '#414868',
        'tokyo-terminal-red': '#f7768e',
        'tokyo-terminal-green': '#9ece6a',
        'tokyo-terminal-yellow': '#e0af68',
        'tokyo-terminal-blue': '#7aa2f7',
        'tokyo-terminal-magenta': '#bb9af7',
        'tokyo-terminal-cyan': '#7dcfff',
        'tokyo-terminal-white': '#c0caf5',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'tokyo': '0 4px 14px 0 rgba(16, 16, 30, 0.7)',
      },
    },
  },
  plugins: [],
} satisfies Config