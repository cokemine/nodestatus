/* Initializing database for Docker */
if (process.env.IS_DOCKER === 'true') {
  require('./postinstall');
}
