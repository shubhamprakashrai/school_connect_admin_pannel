/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        // Brand: indigo-blue → violet → pink (signature gradient stops)
        brand: {
          50:  '#eef4ff',
          100: '#dbe7ff',
          200: '#bfd2ff',
          300: '#94b2ff',
          400: '#6486ff',
          500: '#3a5dff',
          600: '#2342ed',
          700: '#1c33c7',
          800: '#1c2da1',
          900: '#1c2b80',
        },
        accent: {
          violet: '#7c3aed',
          pink:   '#ec4899',
          cyan:   '#06b6d4',
          emerald:'#10b981',
          amber:  '#f59e0b',
        },
        ink: {
          900: '#0b1020',
          700: '#1f2545',
          500: '#52597a',
          300: '#aab1cb',
        },
        // Legacy "blue" kept so existing components don't break.
        blue: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#1e88e5', 700: '#1976d2',
          800: '#1565c0', 900: '#0d47a1',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      backgroundImage: {
        'brand-gradient':  'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%)',
        'brand-soft':      'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08), rgba(236,72,153,0.08))',
        'mesh-radial':     'radial-gradient(at 20% 20%, rgba(37,99,235,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(124,58,237,0.18) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(236,72,153,0.12) 0px, transparent 50%)',
        'grid-light':      'linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-light': '40px 40px',
      },
      animation: {
        'fadeInUp':    'fadeInUp 0.6s ease-out',
        'slideInRight':'slideInRight 0.6s ease-out',
        'float':       'float 6s ease-in-out infinite',
        'pulse-slow':  'pulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':     'shimmer 2.4s linear infinite',
        'gradient-x':  'gradient-x 8s ease infinite',
        'blob':        'blob 18s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%':      { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':      { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
      boxShadow: {
        'xl':    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl':   '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow-brand':  '0 0 0 0 rgba(37,99,235,0), 0 12px 32px -8px rgba(37,99,235,0.45)',
        'glow-violet': '0 12px 32px -8px rgba(124,58,237,0.45)',
        'glow-pink':   '0 12px 32px -8px rgba(236,72,153,0.45)',
        'card-soft':   '0 1px 2px rgba(15,23,42,0.05), 0 8px 24px -12px rgba(15,23,42,0.12)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
