#!/usr/bin/env node
const path = require('path');

const args = process.argv.slice(2).join(' ');

const cp = require('child_process');
const { platform } = require('os');
const { resolve } = require('path');

cp.spawn(platform() === 'win32' ? 'npm.cmd' : 'npm', ['run', 'prestart'], {
  env: process.env,
  cwd: resolve(__dirname, '../'),
  stdio: 'inherit'
}).on('close', () => {
  try {
    const pm2 = require('pm2');
    pm2.connect(error => {
      if (error) {
        console.log(error);
        process.exit(2);
      }
      pm2.start(
        {
          name: 'nodestatus',
          script: path.resolve(__dirname, '../build/app.js'),
          args
        },
        error => {
          if (error) throw error.message;
          pm2.disconnect();
        }
      );
    });
  } catch (error) {
    console.log(`[ERROR]: ${error.message || error}`);
    console.log('Something wrong. Please check if you have installed pm2 correctly.');
    console.log('Fallback to non-pm2 daemon');
    require('../build/app');
  }
});
