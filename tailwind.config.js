/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: { DEFAULT: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
      },
    },
  },
  plugins: [],
};
