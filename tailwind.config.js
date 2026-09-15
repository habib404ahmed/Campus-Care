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
        // Deep Midnight Navy palette
        navy: {
          950: '#070b14',
          900: '#0a0f1d',
          850: '#0d1527',
          800: '#111c35',
          700: '#1e2d52',
          600: '#2d4378',
        },
        // Brand primary
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Emergency / critical → red
        emergency: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        // Warning → amber/orange
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Safe / success → emerald
        safe: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Info → sky/cyan
        info: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Surface / neutrals
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 10px 25px -5px rgb(15 23 42 / 0.08), 0 8px 10px -6px rgb(15 23 42 / 0.04)',
        'card-elevated': '0 12px 32px -4px rgb(15 23 42 / 0.08), 0 4px 12px -2px rgb(15 23 42 / 0.03)',
        'glow-brand': '0 0 24px -2px rgb(59 130 246 / 0.35)',
        'glow-emergency': '0 0 28px 0 rgb(244 63 94 / 0.45)',
        'glow-safe': '0 0 24px -2px rgb(16 185 129 / 0.35)',
        'sos': '0 0 0 0 rgb(244 63 94 / 0.7)',
        'sos-pulse': '0 0 0 20px rgb(244 63 94 / 0)',
        'modal': '0 25px 60px -15px rgb(0 0 0 / 0.3)',
      },
      animation: {
        'sos-pulse': 'sos-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'bounce-in': 'bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'sos-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(244 63 94 / 0.6), 0 0 20px 0 rgb(244 63 94 / 0.4)' },
          '50%': { boxShadow: '0 0 0 22px rgb(244 63 94 / 0), 0 0 40px 6px rgb(244 63 94 / 0.15)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'bounce-in': {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}
