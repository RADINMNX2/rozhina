/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        alabaster: '#FAF8F5',
        espresso: '#1C1917',
        gold: '#D4AF37',
        goldsoft: '#E7CE9C',
        taupe: '#8C827A',
        cream: '#F3E9DA',
        latte: '#B08968',
        charcoal: '#3C3A39',
        emeraldDeep: '#14432B',
        terracotta: '#BC5840',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
        serif: ['Cinzel', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest2: '0.45em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(26px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        'badge-pop': {
          '0%': { transform: 'scale(0.3)' },
          '60%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        'drawer-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'zoom-slow': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.6s ease both',
        marquee: 'marquee 38s linear infinite',
        float: 'float 5.5s ease-in-out infinite',
        'badge-pop': 'badge-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'zoom-slow': 'zoom-slow 16s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};