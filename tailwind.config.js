/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        turquoise: {
          DEFAULT: '#0CB4CC',
          light: '#3DCFE4',
          dark: '#0A8AA3',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          light: '#FF9B9B',
          dark: '#E04848',
        },
        navy: {
          DEFAULT: '#0A1628',
          mid: '#0D2B4A',
          light: '#1A3F63',
        },
        sand: {
          DEFAULT: '#FFF8F0',
          dark: '#F5EDE0',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float-up': 'floatUp 8s linear infinite',
        'wave': 'waveMove 12s linear infinite',
        'wave-slow': 'waveMove 18s linear infinite',
        'wave-fast': 'waveMove 8s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'count-flip': 'countFlip 0.3s ease-out',
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(100vh) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-10vh) translateX(30px)', opacity: '0' },
        },
        waveMove: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(12, 180, 204, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(12, 180, 204, 0.8), 0 0 60px rgba(12, 180, 204, 0.3)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        countFlip: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
