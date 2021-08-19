import { Sequelize } from 'sequelize-typescript';
import Server from '../schema/server';
import { dirname } from 'path';
import config from './config';
import { mkdirSync } from 'fs';

mkdirSync(dirname(config.database), { recursive: true });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.database,
  logging: false,
  models: [Server]
});

export default sequelize;
