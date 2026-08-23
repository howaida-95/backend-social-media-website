/*
Responsible for actually starting the server.

server.ts
│
├── Load environment
├── Connect Sequelize → MySQL
├── Start HTTP server
└── Handle startup errors
*/

import { env } from './config/env.ts';
import { connectDatabase } from './config/database.ts';
import app from './app.ts';

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();