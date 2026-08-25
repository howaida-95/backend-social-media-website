require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'pingup_DATABASE',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    }
  },
  test: {
    username: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME_TEST || 'pingup_test',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    }
  },
  production: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    }
  }
};