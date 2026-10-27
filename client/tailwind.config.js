/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#FAF7F0',
          200: '#F4EFE6',
          300: '#E8E1D3',
          400: '#D5CBB8',
        },
        forest: {
          50: '#EBF4F0',
          100: '#D2E6DC',
          200: '#A7CDBD',
          500: '#2D6A4F',
          600: '#21533D',
          700: '#1B4332',
          800: '#143427',
          900: '#0E231A',
        },
        terracotta: {
          50: '#FDF5F2',
          100: '#FBE8E2',
          500: '#D96846',
          600: '#C25433',
          700: '#A43E20',
        },
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          500: '#64748B',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(27, 67, 50, 0.05), 0 4px 6px -2px rgba(27, 67, 50, 0.03)',
        card: '0 4px 20px -2px rgba(27, 67, 50, 0.07)',
        elevated: '0 12px 30px -4px rgba(27, 67, 50, 0.12)',
      },
    },
  },
  plugins: [],
};

