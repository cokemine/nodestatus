/* Initializing database for Docker */
const { initDatabase } = require('./utils');

if (process.env.IS_DOCKER === 'true') {
  initDatabase();
}
