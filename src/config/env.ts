/*
Environment configuration
Responsible for loading and validating environment variables.
*/

import 'dotenv/config';
import { parseDurationToMs } from '@utils/duration';

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
const nodeEnv = process.env.NODE_ENV || 'development';
const port = Number(process.env.PORT) || 5000;
const backendPublicUrl = (
  process.env.BACKEND_PUBLIC_URL ||
  (nodeEnv !== 'production' ? `http://localhost:${port}` : '')
)
  .trim()
  .replace(/\/+$/, '');

if (!backendPublicUrl) {
  throw new Error('BACKEND_PUBLIC_URL must be set in production');
}

const parsedBackendPublicUrl = new URL(backendPublicUrl);
if (!['http:', 'https:'].includes(parsedBackendPublicUrl.protocol)) {
  throw new Error('BACKEND_PUBLIC_URL must use HTTP or HTTPS');
}

export const env = {
  port,
  nodeEnv,
  backendPublicUrl,
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
  jwtCookieMaxAgeMs: parseDurationToMs(jwtExpiresIn),
  refreshTokenExpiresIn,
  refreshTokenCookieMaxAgeMs: parseDurationToMs(refreshTokenExpiresIn),
  googleClientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),
  googleClientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
  googleRedirectUri: (
    process.env.GOOGLE_REDIRECT_URI ||
    `http://localhost:${process.env.PORT || 5000}/api/v1/auth/google/callback`
  ).trim(),
  emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
};
