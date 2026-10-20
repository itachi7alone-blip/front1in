import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pancake-teal': '#1FC7D4',
        'pancake-purple': '#7645D9',
        'pancake-brown': '#633001',
        'pancake-amber': '#FFB237',
        'pancake-dark': '#1A1A1A',
        'pancake-gray': '#666666',
        'pancake-light': '#FAF9FA',
        'pancake-line': '#E5E5E5',
        'pancake-success': '#31D0AA',
        'pancake-error': '#ED4B9E',
      },
      fontFamily: {
        kanit: ['var(--font-kanit)', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        button: '16px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 20px rgba(0,0,0,0.12)',
        glow: '0 0 40px rgba(31,199,212,0.35)',
        'glow-error': '0 0 40px rgba(237,75,158,0.35)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 30px rgba(237,75,158,0.5)' },
          '50%': { opacity: '0.85', boxShadow: '0 0 50px rgba(237,75,158,0.9)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s ease-out forwards',
        'pulse-glow': 'pulse-glow 1.6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        'check-pop': 'check-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
      },
    },
  },
  plugins: [],
};

export default config;
