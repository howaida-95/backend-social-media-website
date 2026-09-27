/*
Responsible for creating/configuring Express.
It is the entry point for the application.
It is responsible for 
- creating the express app and configuring it.
- setting up the middleware for the application.
- setting up the routes for the application.
- setting up the error handling middleware for the application.
- exporting the app for the server.
*/

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from '@modules/auth/auth.routes';
import { env } from '@config/env';
import { AppError } from '@utils/AppError';

const app = express();

// helmet is used to secure the app by setting various HTTP headers
app.use(helmet());
// cors is used to allow the app to be accessed from the frontend
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
// express.json() is used to parse the request body as JSON
app.use(express.json());
// express.urlencoded({ extended: true }) is used to parse the request body as URL encoded data
app.use(express.urlencoded({ extended: true }));
// cookieParser is used to parse the request body as cookies
app.use(cookieParser());

// health check route
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

// auth routes
app.use('/api/v1/auth', authRoutes);

// 404 route
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (err instanceof AppError) {
      if (typeof err.details.retryAfter === 'number') {
        res.setHeader('Retry-After', String(err.details.retryAfter));
      }

      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ...(typeof err.details.retryAfter === 'number'
          ? { retryAfter: err.details.retryAfter }
          : {}),
      });
    }

    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  },
);

export default app;
