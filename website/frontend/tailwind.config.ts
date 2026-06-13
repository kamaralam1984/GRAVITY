import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx,js,jsx,mdx}',
    './components/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:             'var(--bg)',
        surface:        'var(--bg-surface)',
        surface2:       'var(--bg-surface2)',
        surface3:       'var(--bg-surface3)',
        'text-primary': 'var(--text-primary)',
        'text-secondary':'var(--text-secondary)',
        'text-muted':   'var(--text-muted)',
        primary:        'var(--primary)',
        accent:         'var(--accent)',
        safe:           'var(--safe)',
        sos:            'var(--sos)',
        gold:           'var(--gold)',
        'gravity-bg':   '#070B14',
        muted:          '#64748B',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue':   '0 0 40px rgba(59,130,246,0.25)',
        'glow-violet': '0 0 40px rgba(139,92,246,0.25)',
        'glow-red':    '0 0 60px rgba(239,68,68,0.4)',
        'glow-gold':   '0 0 40px rgba(245,158,11,0.3)',
        'glow-green':  '0 0 40px rgba(16,185,129,0.3)',
        card:          '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'hero-gradient':  'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.18) 0%, rgba(5,10,24,0) 70%), radial-gradient(ellipse 40% 40% at 80% 20%, rgba(139,92,246,0.12) 0%, transparent 60%), linear-gradient(180deg, #050A18 0%, #050A18 100%)',
        'card-gradient':  'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'blue-violet':    'linear-gradient(to right, #3B82F6, #8B5CF6)',
        'gold-red':       'linear-gradient(to right, #F59E0B, #EF4444)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59,130,246,0.2)' },
          '50%':      { boxShadow: '0 0 50px rgba(59,130,246,0.5)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'ping-slow': {
          '0%':   { transform: 'scale(1)',   opacity: '1' },
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        orbit: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float:        'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        shimmer:      'shimmer 2.5s linear infinite',
        'ping-slow':  'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite',
        orbit:        'orbit 12s linear infinite',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.5rem',
        xl4: '2rem',
      },
    },
  },
  plugins: [],
}

export default config
