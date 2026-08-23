
/*
Responsible for creating/configuring your Sequelize instance.
*/

import { Sequelize } from 'sequelize';

import { env } from './env.ts';

const sequelize = new Sequelize(
  env.database.name,
  env.database.user,
  env.database.password,
  {
    host: env.database.host,
    port: env.database.port,
    dialect: 'mysql',
    logging: false,
  }
);

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();

    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);

    throw error;
  }
};

export { sequelize, connectDatabase };