/*
Environment configuration
PORT
NODE_ENV
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD

Responsible for loading and validating environment variables.
1. Centralization:Instead of being scattered across the application, you have one place
2. Cleaner application code
3. Easier validation
4. Better architecture
*/

import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 5000,

  database: {
    host: process.env.DATABASE_HOST!,
    port: Number(process.env.DATABASE_PORT),
    name: process.env.DATABASE_NAME!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
  },

  frontendUrl: process.env.FRONTEND_URL!,
};