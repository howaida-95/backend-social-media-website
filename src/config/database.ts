
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
    logging: env.nodeEnv === 'development' ? console.log : false,

    define: {
      timestamps: true,
      // Sequelize will map createdAt → created_at (cleaner database column names)
      underscored: true,
    },

  }
);

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync(); // NOT USED IN PRODUCTION
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);

    throw error;
  }
};

export { sequelize, connectDatabase };