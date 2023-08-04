#!/usr/bin/env node
import { spawn } from 'child_process';
import { platform } from 'os';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const args = process.argv.slice(2).join(' ');
const __dirname = dirname(fileURLToPath(import.meta.url));

spawn(platform() === 'win32' ? 'npm.cmd' : 'npm', ['run', 'prestart'], {
  env: process.env,
  cwd: resolve(__dirname, '../'),
  stdio: 'inherit'
}).on('close', async () => {
  try {
    // ES6 import not read NODE_PATH env
    // const pm2 = await import('pm2');
    const pm2 = createRequire(import.meta.url)('pm2');
    pm2.connect(error => {
      if (error) {
        console.log(error);
        process.exit(2);
      }
      pm2.start(
        {
          name: 'nodestatus',
          script: resolve(__dirname, '../build/app.js'),
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
    await import('../build/app.js');
  }
});
