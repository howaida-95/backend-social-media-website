/*
Responsible for creating/configuring Express.
app.ts
│
├── Create Express app
├── Global middleware
├── Routes
├── 404 handler
├── Error handler
└── Export app
*/

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.ts';

const app = express();

/**
 * Global middlewares
*/

/*
Helmet is a security middleware for Express.
It automatically adds several HTTP security headers to your responses.
*/
app.use(helmet());
/*
CORS stands for:Cross-Origin Resource Sharing
It controls whether a browser is allowed to make requests to your backend from a different origin.
=> Access-Control-Allow-Origin: *
*/
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true
  }));

/*
It tells Express:
If the request contains JSON, parse it and make it available through req.body.
*/
app.use(express.json());
/*
This parses requests containing:
application/x-www-form-urlencoded
*/
app.use(express.urlencoded({ extended: true }));

/**
 * Health check
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

/**
 * API Routes
 *
 * Routes will be registered here as modules are implemented.
 *
 * Example:
 * app.use('/api/v1/auth', authRoutes);
 * app.use('/api/v1/users', userRoutes);
 */

/**
 * 404 Handler
 */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/**
 * Global Error Handler
 *
 * This will be replaced/connected to the centralized
 * error middleware when we implement Phase 5.
 */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

export default app;
