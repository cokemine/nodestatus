#!/usr/bin/env node

const cp = require('child_process');
const { platform } = require('os');
const { resolve } = require('path');

cp.spawn(platform() === 'win32' ? 'npm.cmd' : 'npm', ['run', 'start'], {
  env: process.env,
  cwd: resolve(__dirname, '../'),
  stdio: 'inherit'
});
