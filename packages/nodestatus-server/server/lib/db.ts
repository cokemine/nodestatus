import { dirname } from 'path';
import { mkdirSync } from 'fs';
import { Sequelize } from 'sequelize-typescript';
import { Server, Order } from '../schema/server';
import config from './config';

mkdirSync(dirname(config.database), { recursive: true });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: require('sqlite3'),
  storage: config.database,
  logging: false,
  models: [Server, Order]
});

export default sequelize;
