import jwt from 'jsonwebtoken';
import { CookieOptions, Response } from 'express';
import { env } from '@config/env';
import type { AuthJwtPayload } from '@modules/auth/auth.types';

const COOKIE_NAME = 'token';

// signToken is used to sign the token for the user
export const signToken = (userId: number, role: string): string => {
  return jwt.sign({ userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
};

// verifyToken is used to verify the token for the user
export const verifyToken = (token: string): AuthJwtPayload => {
  return jwt.verify(token, env.jwtSecret) as AuthJwtPayload;
};

// getAuthCookieOptions is used to get the cookie options for the user
export const getAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: env.jwtCookieMaxAgeMs,
});

// setAuthCookie is used to set the cookie for the user
export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, getAuthCookieOptions());
};

// clearAuthCookie is used to clear the cookie for the user
export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, getAuthCookieOptions());
};

/*
It converts JWT_EXPIRES_IN (e.g. "1h") into milliseconds for the auth cookie’s maxAge.
we use one env vlue in 1h format 
But two libraries need different formats:
jwt.sign(..., { expiresIn }) => "1h"
res.cookie(..., { maxAge }) ==> 3600000 (ms)
*/

export const parseJwtCookieMaxAgeMs = (expiresIn: string): number => {
  const match = /^(\d+)([smhd])$/i.exec(expiresIn.trim());
  if (!match) {
    return 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (multipliers[unit] || 60 * 60 * 1000);
};
export { COOKIE_NAME };
