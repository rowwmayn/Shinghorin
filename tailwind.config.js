/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FBF1DE',
          deep: '#F0E2C4',
        },
        ink: '#2B2118',
        marigold: {
          DEFAULT: '#E8A33D',
          deep: '#C4801F',
        },
        plum: {
          DEFAULT: '#8B3A62',
          deep: '#6E2A4C',
        },
        teal: {
          DEFAULT: '#2F7A6E',
          deep: '#255f56',
        },
        line: 'rgba(43, 33, 24, 0.16)',
      },
      fontFamily: {
        display: ['var(--font-baloo)', 'Baloo 2', 'sans-serif'],
        body: ['var(--font-quicksand)', 'Quicksand', 'sans-serif'],
        hand: ['var(--font-kalam)', 'Kalam', 'cursive'],
        mono: ['var(--font-space-mono)', 'Space Mono', 'monospace'],
        bn: ['var(--font-noto-bengali)', 'Noto Serif Bengali', 'serif'],
      },
    },
  },
  plugins: [],
};
