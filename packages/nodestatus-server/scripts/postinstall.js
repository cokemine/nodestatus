const path = require('path');
const { homedir } = require('os');
const dotenv = require('dotenv');
const { initDatabase } = require('./utils');

dotenv.config({ path: path.resolve(homedir(), '.nodestatus/.env.local') });

initDatabase();
