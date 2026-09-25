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

/** @deprecated use ACCESS_COOKIE_NAME */
export const COOKIE_NAME = ACCESS_COOKIE_NAME;

export { parseDurationToMs };

/** @deprecated use parseDurationToMs */
export const parseJwtCookieMaxAgeMs = parseDurationToMs;

export const signAccessToken = (userId: number, role: string): string => {
  return jwt.sign({ userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
};

/** @deprecated use signAccessToken */
export const signToken = signAccessToken;

export const verifyAccessToken = (token: string): AuthJwtPayload => {
  return jwt.verify(token, env.jwtSecret) as AuthJwtPayload;
};

/** @deprecated use verifyAccessToken */
export const verifyToken = verifyAccessToken;

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
 * Hash a refresh token
 * @param rawToken - The raw refresh token
 * @returns The hashed refresh token
 hashRefreshToken turns the raw refresh token into a SHA-256 hex string before it touches the database.
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

/** @deprecated use setAuthCookies */
export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(ACCESS_COOKIE_NAME, token, getAccessCookieOptions());
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(ACCESS_COOKIE_NAME, getAccessCookieOptions());
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
};

/** @deprecated use clearAuthCookies */
export const clearAuthCookie = clearAuthCookies;
