#!/usr/bin/env node
const pm2 = require('pm2');
const path = require('path');

const args = process.argv.slice(2).join(' ');

pm2.connect(error => {
  if (error) {
    console.log(error);
    process.exit(2);
  }
  pm2.start(
    {
      name: 'nodestatus',
      script: path.resolve(__dirname, '../dist/app.js'),
      args
    },
    error => {
      error && console.log(error);
      pm2.disconnect();
    }
  );
});

