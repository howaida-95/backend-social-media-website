import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { CookieOptions, Response } from 'express';
import { env } from '@config/env';
import { parseDurationToMs } from '@utils/duration';
import type { AuthJwtPayload } from '@modules/auth/auth.types';

/** Short-lived access JWT cookie */
export const ACCESS_COOKIE_NAME = 'token';
/** Long-lived opaque refresh token cookie */
export const REFRESH_COOKIE_NAME = 'refresh_token';

export { parseDurationToMs };

const JWT_ALGORITHM: jwt.Algorithm = 'HS256';

// Sign and verify JWTs for access tokens, and create/verify refresh tokens.
export const signAccessToken = (userId: number, role: string): string => {
  return jwt.sign({ userId, role }, env.jwtSecret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
};

// Verify the access token and return the decoded payload, or throw an error if invalid.
export const verifyAccessToken = (token: string): AuthJwtPayload => {
  const decoded = jwt.verify(token, env.jwtSecret, {
    algorithms: [JWT_ALGORITHM],
  });
  if (typeof decoded === 'string') {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }
  return decoded as AuthJwtPayload;
};

/** ISO expiry from JWT `exp` (httpOnly access cookie is not readable by JS). */
export const getAccessTokenExpiresAtIso = (accessToken: string): string => {
  const decoded = jwt.decode(accessToken) as AuthJwtPayload | null;
  if (decoded?.exp) {
    return new Date(decoded.exp * 1000).toISOString();
  }
  return new Date(Date.now() + env.jwtCookieMaxAgeMs).toISOString();
};

export const createRefreshTokenValue = (): string =>
  crypto.randomBytes(48).toString('hex');

/**
 * Hash a refresh token with SHA-256 so the raw value never touches the database.
 * @param rawToken - The raw refresh token
 * @returns The hex-encoded SHA-256 hash
 */
export const hashRefreshToken = (rawToken: string): string =>
  crypto.createHash('sha256').update(rawToken).digest('hex');

const baseCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  path: '/',
});

export const getAccessCookieOptions = (): CookieOptions => ({
  ...baseCookieOptions(),
  maxAge: env.jwtCookieMaxAgeMs,
});

export const getRefreshCookieOptions = (): CookieOptions => ({
  ...baseCookieOptions(),
  maxAge: env.refreshTokenCookieMaxAgeMs,
});

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
): void => {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, getAccessCookieOptions());
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
};

export const clearAuthCookies = (res: Response): void => {
  // Don't pass maxAge/expires to clearCookie: Express 5 ignores them,
  // Express 4 deprecates them. Path/flags must still match the originals.
  const options = baseCookieOptions();
  res.clearCookie(ACCESS_COOKIE_NAME, options);
  res.clearCookie(REFRESH_COOKIE_NAME, options);
};