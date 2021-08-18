import { Sequelize } from 'sequelize-typescript';
import { resolve } from 'path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.db,
  logging: false,
  models: [resolve(__dirname, '../schema')]
});

export default sequelize;
