import { Sequelize } from 'sequelize-typescript';
import { dirname } from 'path';
import { Server } from '../schema/server';
import config from './config';
import { mkdirSync } from 'fs';

mkdirSync(dirname(config.database), { recursive: true });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: require('sqlite3'),
  storage: config.database,
  logging: false,
  models: [Server]
});

export default sequelize;
