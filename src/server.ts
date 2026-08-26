/*
Responsible for actually starting the server.

server.ts
│
├── Load environment
├── Connect Sequelize → MySQL
├── Start HTTP server
└── Handle startup errors
*/

import { env } from '@config/env';
import { connectDatabase } from '@config/database';
import app from '@app';

/* Load associations before the application starts
This ensures the models and associations are loaded before requests start hitting the application.
*/
import '@database/models';

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