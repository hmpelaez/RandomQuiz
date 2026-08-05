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
        cyber: {
          950: '#030712',
          900: '#060b17',
          850: '#0b1329',
          800: '#111c38',
          700: '#1e294b',
          border: 'rgba(0, 240, 255, 0.15)',
        },
        neon: {
          green: '#00ff66',
          'green-glow': 'rgba(0, 255, 102, 0.4)',
          cyan: '#00f0ff',
          'cyan-glow': 'rgba(0, 240, 255, 0.4)',
          magenta: '#ff007f',
          'magenta-glow': 'rgba(255, 0, 127, 0.4)',
          yellow: '#ffe600',
          red: '#ff2a6d',
          'red-glow': 'rgba(255, 42, 109, 0.4)',
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 0 15px rgba(0, 255, 102, 0.35), inset 0 0 10px rgba(0, 255, 102, 0.1)',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.35), inset 0 0 10px rgba(0, 240, 255, 0.1)',
        'neon-magenta': '0 0 15px rgba(255, 0, 127, 0.35), inset 0 0 10px rgba(255, 0, 127, 0.1)',
        'neon-red': '0 0 15px rgba(255, 42, 109, 0.4), inset 0 0 10px rgba(255, 42, 109, 0.15)',
        'cyber-card': '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(0, 240, 255, 0.15)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        },
        glowPulse: {
          '0%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.4))' },
          '100%': { opacity: '1', filter: 'drop-shadow(0 0 18px rgba(0, 240, 255, 0.8))' }
        }
      }
    },
  },
  plugins: [],
}
