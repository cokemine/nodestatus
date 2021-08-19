import config from './lib/config';
import db from './lib/db';

db.sync({ alter: true }).then(() =>
  config.NODE_ENV === 'development'
    ? import('./app.dev')
    : import('./app.prod')
);
