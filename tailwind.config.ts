import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'winner-kick': {
          '0%': { transform: 'translateX(0) scale(1)' },
          '50%': { transform: 'translateX(50px) scale(1.2) rotate(10deg)' },
          '100%': { transform: 'translateX(0) scale(1)' }
        },
        'loser-kicked': {
          '0%': { transform: 'translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateX(-30px) rotate(-20deg) scale(0.9)' },
          '100%': { transform: 'translateX(200px) rotate(180deg) scale(0.5) opacity(0)' }
        },
        'battle-hover': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'battle-shake': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' }
        },
        'vs-pulse': {
          '0%, 100%': { 
            transform: 'scale(1)',
            filter: 'brightness(1)',
            textShadow: '0 0 20px #ff0000'
          },
          '50%': { 
            transform: 'scale(1.5)',
            filter: 'brightness(1.5)',
            textShadow: '0 0 40px #ff0000'
          }
        },
        'lightning': {
          '0%, 100%': { opacity: '0' },
          '10%, 90%': { opacity: '1' },
          '20%, 80%': { opacity: '0' },
          '30%, 70%': { opacity: '1' },
          '40%, 60%': { opacity: '0' },
          '50%': { opacity: '1' }
        },
        'flip': {
          '0%, 100%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(180deg)' }
        },
        'scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        'winner-kick': 'winner-kick 1s ease-in-out',
        'loser-kicked': 'loser-kicked 1s ease-in-out forwards',
        'battle-hover': 'battle-hover 2s ease-in-out infinite',
        'battle-shake': 'battle-shake 0.5s ease-in-out infinite',
        'vs-pulse': 'vs-pulse 1.5s ease-in-out infinite',
        'lightning': 'lightning 2s ease-in-out infinite',
        'flip': 'flip 3s ease-in-out infinite',
        'scroll': 'scroll 20s linear infinite'
      }
    },
  },
  plugins: [],
} satisfies Config;
