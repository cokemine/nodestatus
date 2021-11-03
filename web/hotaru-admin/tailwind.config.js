const { violet, rose } = require('tailwindcss/colors');

module.exports = {
  purge: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        violet,
        rose
      },
      screens: {
        xs: '576px'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
