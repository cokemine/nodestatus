#!/usr/bin/env node

import { spawn } from 'child_process';
import { platform } from 'os';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

spawn(platform() === 'win32' ? 'npm.cmd' : 'npm', ['run', 'start'], {
  env: process.env,
  cwd: resolve(__dirname, '../'),
  stdio: 'inherit'
});
