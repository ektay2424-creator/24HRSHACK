/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0F17',
        slate: { 700: '#334155', 600: '#475569', 500: '#64748B', 400: '#94A3B8', 300: '#CBD5E1', 200: '#E2E8F0' },
        indigo: { 500: '#6366F1', 400: '#818CF8', 300: '#A5ACFB' },
        rose: { DEFAULT: '#F43F5E', 300: '#FDA4AF' },
        mint: { 400: '#6EE7B7', 300: '#A7F3D0' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'], display: ['Sora', 'sans-serif'] },
      backgroundImage: {
        'grid-overlay': 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'equalizer': 'equalizer 0.8s ease-in-out infinite alternate',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        fadeInUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: 0, transform: 'translateX(20px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
        pulseRing: { '0%': { transform: 'scale(1)', opacity: 0.7 }, '100%': { transform: 'scale(1.1)', opacity: 0 } },
        equalizer: { '0%': { transform: 'scaleY(0.4)' }, '100%': { transform: 'scaleY(1)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
    },
  },
  plugins: [],
};