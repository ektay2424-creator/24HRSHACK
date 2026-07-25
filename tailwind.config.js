/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0F17',
        panel: {
          DEFAULT: '#131924',
          raised: '#161D2B',
          hover: '#1A2233',
        },
        hairline: '#1E2638',
        hairlineSoft: '#171F2E',
        indigo: {
          DEFAULT: '#6366F1',
          50: '#EEF0FF',
          100: '#E0E3FF',
          200: '#C7CCFE',
          300: '#A5ACFB',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        rose: {
          DEFAULT: '#F43F5E',
          300: '#FDA4AF',
          400: '#FB7185',
        },
        mint: {
          DEFAULT: '#10B981',
          300: '#6EE7B7',
          400: '#34D399',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'grid-overlay':
          'linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px)',
        'indigo-fade':
          'linear-gradient(120deg, #818CF8, #6366F1)',
        'mint-fade':
          'linear-gradient(120deg, #34D399, #10B981)',
        'rose-fade':
          'linear-gradient(120deg, #FB7185, #F43F5E)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(244,63,94,0.18)' },
          '70%': { boxShadow: '0 0 0 6px rgba(244,63,94,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(244,63,94,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'equalizer': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'fade-in-up': 'fade-in-up 0.45s ease-out forwards',
        'fade-in': 'fade-in 0.35s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
        'equalizer': 'equalizer 0.8s ease-in-out infinite',
        'spin-slow': 'spin-slow 12s linear infinite',
      },
    },
  },
  plugins: [],
};
