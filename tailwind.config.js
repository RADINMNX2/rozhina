/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0C0B0A',
        charcoal: '#141312',
        eclipse: '#1B1918',
        pearl: '#F3F0EA',
        taupe: '#9E9890',
        gold: '#E2C997',
        bronze: '#C4A47C',
        cream: '#F3E9DA',
        latte: '#B08968',
        emeraldDeep: '#14432B',
        terracotta: '#BC5840',
        glass: 'rgba(25, 24, 23, 0.7)',
        alabaster: '#F3F0EA',
        espresso: '#141312',
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
        serif: ['Cinzel', 'Georgia', 'serif'],
      },
      letterSpacing: {
        widest2: '0.45em',
      },
      boxShadow: {
        'gold-glow':
          '0 0 45px -12px rgba(226, 201, 151, 0.35), inset 0 0 0 1px rgba(226, 201, 151, 0.06)',
        'gold-cta':
          '0 16px 50px -16px rgba(226, 201, 151, 0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
        'nav-float': '0 12px 40px -18px rgba(0,0,0,0.65)',
        'dot-glow': '0 0 16px rgba(226, 201, 151, 0.4)',
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
        'zoom-slow': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
        ambient: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.07)' },
        },
        'toast-countdown': {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.6s ease both',
        marquee: 'marquee 38s linear infinite',
        float: 'float 5.5s ease-in-out infinite',
        'badge-pop': 'badge-pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'zoom-slow': 'zoom-slow 16s ease-in-out infinite',
        ambient: 'ambient 9s ease-in-out infinite',
        'toast-countdown': 'toast-countdown 3.6s linear forwards',
      },
    },
  },
  plugins: [],
};