import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import authService from '@modules/auth/auth.service';
import {
  ACCESS_COOKIE_NAME,
  clearAuthCookies,
  getAccessTokenExpiresAtIso,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
} from '@utils/jwt';
import { AppError } from '@utils/AppError';
import { env } from '@config/env';
import type { SessionMeta } from '@modules/auth/auth.types';

const OAUTH_STATE_COOKIE = 'oauth_state';

const oauthStateCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 10 * 60 * 1000,
};

const frontendSignInError = (code: string) =>
  `${env.frontendUrl}/signIn?error=${encodeURIComponent(code)}`;

const getSessionMeta = (req: Request): SessionMeta => ({
  userAgent: req.get('user-agent') ?? null,
  ipAddress: req.ip ?? null,
});

const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body, getSessionMeta(req));
      setAuthCookies(res, result.accessToken, result.refreshToken);
      return res.status(201).json({
        message: 'User created successfully',
        user: result.user,
        accessTokenExpiresAt: result.accessTokenExpiresAt,
      });
    } catch (error) {
      return next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body, getSessionMeta(req));
      setAuthCookies(res, result.accessToken, result.refreshToken);
      return res.status(200).json({
        message: 'Login successful',
        user: result.user,
        accessTokenExpiresAt: result.accessTokenExpiresAt,
      });
    } catch (error) {
      return next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
      await authService.logout(refreshToken);
      clearAuthCookies(res);
      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      return next(error);
    }
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
      if (!refreshToken) {
        throw new AppError(401, 'Unauthorized');
      }

      const result = await authService.refreshToken(
        refreshToken,
        // Get the session meta from the request ex: user agent, ip address, etc.
        getSessionMeta(req),
      );
      setAuthCookies(res, result.accessToken, result.refreshToken);
      return res.status(200).json({
        message: 'Token refreshed',
        user: result.user,
        accessTokenExpiresAt: result.accessTokenExpiresAt,
      });
    } catch (error) {
      clearAuthCookies(res);
      return next(error);
    }
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }
      const user = await authService.me(req.user);
      const accessToken = req.cookies?.[ACCESS_COOKIE_NAME] as string | undefined;
      return res.status(200).json({
        user,
        accessTokenExpiresAt: accessToken
          ? getAccessTokenExpiresAtIso(accessToken)
          : null,
      });
    } catch (error) {
      return next(error);
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.forgotPassword(req.body);
      return res.status(200).json({
        message: 'If that email exists, a reset link has been sent',
      });
    } catch (error) {
      return next(error);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.resetPassword(req.body);
      return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      return next(error);
    }
  },

  googleAuth: (_req: Request, res: Response, next: NextFunction) => {
    try {
      const state = crypto.randomBytes(16).toString('hex');
      res.cookie(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions);
      const url = authService.getGoogleAuthUrl(state);
      return res.redirect(url);
    } catch (error) {
      return next(error);
    }
  },

  googleCallback: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = typeof req.query.code === 'string' ? req.query.code : undefined;
      const state = typeof req.query.state === 'string' ? req.query.state : undefined;
      const storedState = req.cookies?.[OAUTH_STATE_COOKIE];

      res.clearCookie(OAUTH_STATE_COOKIE, oauthStateCookieOptions);

      if (req.query.error) {
        return res.redirect(frontendSignInError('google_denied'));
      }

      if (!code || !state || !storedState || state !== storedState) {
        return res.redirect(frontendSignInError('google_invalid_state'));
      }

      const result = await authService.loginWithGoogleCode(
        code,
        getSessionMeta(req),
      );
      setAuthCookies(res, result.accessToken, result.refreshToken);
      return res.redirect(`${env.frontendUrl}/`);
    } catch (error) {
      console.error('Google OAuth callback failed:', error);
      return res.redirect(frontendSignInError('google_auth_failed'));
    }
  },
};

export default authController;
