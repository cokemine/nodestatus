const { resolve } = require('path');

module.exports = {
  plugins: [
    require('tailwindcss')(resolve(__dirname, './tailwind.config.js')),
    require('autoprefixer')
  ]
};
