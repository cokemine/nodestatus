const { violet } = require('tailwindcss/colors');

module.exports = {
  purge: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        violet
      },
      backgroundImage: {
        login: "url('./assets/img/bg_howatama.png')"
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
