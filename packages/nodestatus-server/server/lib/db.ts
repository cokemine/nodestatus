import { dirname } from 'path';
import { mkdirSync } from 'fs';
import { Sequelize } from 'sequelize-typescript';
import { Server } from '../schema/server';
import config from './config';

mkdirSync(dirname(config.database), { recursive: true });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: require('sqlite3'),
  storage: config.database,
  logging: false,
  models: [Server]
});

export default sequelize;
