/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#040612',
        nebula: '#72f7ff',
        plasma: '#ff7c6b',
        aurora: '#a4ff86',
        starlight: '#f6f7fb',
      },
      boxShadow: {
        glow: '0 0 30px rgba(114, 247, 255, 0.18)',
      },
      backgroundImage: {
        noise:
          'radial-gradient(circle at top, rgba(114, 247, 255, 0.18), transparent 30%), radial-gradient(circle at bottom, rgba(255, 124, 107, 0.12), transparent 35%)',
      },
      animation: {
        drift: 'drift 18s ease-in-out infinite',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
