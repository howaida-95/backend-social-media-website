/*
Environment configuration
Responsible for loading and validating environment variables.
*/

import 'dotenv/config';
import { parseJwtCookieMaxAgeMs } from '../utils/jwt';


const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DATABASE_HOST!,
    port: Number(process.env.DATABASE_PORT),
    name: process.env.DATABASE_NAME!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
  },
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/\/$/, ''),
  jwtSecret: (process.env.JWT_SECRET || 'dev-secret-change-me').trim(),
  jwtExpiresIn,
  jwtCookieMaxAgeMs: parseJwtCookieMaxAgeMs(jwtExpiresIn),
  googleClientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),
  googleClientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
  googleRedirectUri: (
    process.env.GOOGLE_REDIRECT_URI ||
    `http://localhost:${process.env.PORT || 5000}/api/v1/auth/google/callback`
  ).trim(),
  emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
};
