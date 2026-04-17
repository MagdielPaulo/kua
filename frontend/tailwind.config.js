/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020617',
          900: '#060e1e',
          800: '#0d1a2e',
          700: '#132238',
        },
        cyan: { electric: '#22d3ee' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'shimmer':    'shimmer 1.8s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'reveal':     'reveal 0.6s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        'glow-pulse': {
          '0%,100%': { boxShadow: '0 0 12px rgba(34,211,238,.25), 0 0 32px rgba(34,211,238,.10)' },
          '50%':      { boxShadow: '0 0 24px rgba(34,211,238,.50), 0 0 56px rgba(34,211,238,.20)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        reveal: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glass':      'inset 0 1px 0 rgba(255,255,255,.08), 0 4px 32px rgba(0,0,0,.5)',
        'glass-hover':'inset 0 1px 0 rgba(255,255,255,.14), 0 8px 40px rgba(0,0,0,.6)',
        'cyan-glow':  '0 0 20px rgba(34,211,238,.3)',
        'cyan-glow-lg':'0 0 40px rgba(34,211,238,.35)',
        'inner-glow': 'inset 0 0 20px rgba(34,211,238,.06)',
      },
    },
  },
  plugins: [],
};
