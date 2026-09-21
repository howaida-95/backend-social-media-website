import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import authService from '@modules/auth/auth.service';
import { clearAuthCookie, COOKIE_NAME, setAuthCookie } from '@utils/jwt';
import { AppError } from '@utils/AppError';
import { env } from '@config/env';

const OAUTH_STATE_COOKIE = 'oauth_state';

const oauthStateCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 10 * 60 * 1000,
};

const frontendSignInError = (code: string) =>
  `${env.frontendUrl}/signIn?error=${encodeURIComponent(code)}`;

// A controller handles the request/response logic between the route and the business logic.
const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Validate the request body
      const result = await authService.register(req.body);
      // 2. Set the auth cookie
      setAuthCookie(res, result.token);
      // 3. Return the response
      return res.status(201).json({
        message: 'User created successfully',
        user: result.user,
      });
    } catch (error) {
      return next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      setAuthCookie(res, result.token);
      return res.status(200).json({
        message: 'Login successful',
        user: result.user,
      });
    } catch (error) {
      return next(error);
    }
  },

  logout: (_req: Request, res: Response) => {
    clearAuthCookie(res);
    return res.status(200).json({ message: 'Logout successful' });
  },

  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[COOKIE_NAME];
      if (!token) {
        throw new AppError(401, 'Unauthorized');
      }
      const result = await authService.refreshToken(token);
      setAuthCookie(res, result.token);
      return res.status(200).json({
        message: 'Token refreshed',
        user: result.user,
      });
    } catch (error) {
      return next(error);
    }
  },

  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }
      const user = await authService.me(req.user);
      return res.status(200).json({ user });
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

  /*
    1. React clicks "Continue with Google"
    2. Browser hits this route → redirect to Google
  */
  googleAuth: (_req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Generate a random state for the OAuth flow
      const state = crypto.randomBytes(16).toString('hex');
      // 2. Set the state in a cookie
      res.cookie(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions);
      // 3. Get the Google OAuth URL
      const url = authService.getGoogleAuthUrl(state);
      // 4. Redirect to the Google OAuth URL
      return res.redirect(url);
    } catch (error) {
      return next(error);
    }
  },

  /*
    Google redirects here with ?code=&state=
    Exchange code → find/create user → set httpOnly cookie → redirect to React
  */
  googleCallback: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = typeof req.query.code === 'string' ? req.query.code : undefined;
      const state = typeof req.query.state === 'string' ? req.query.state : undefined;
      const storedState = req.cookies?.[OAUTH_STATE_COOKIE];

      // 1. Clear the state cookie
      res.clearCookie(OAUTH_STATE_COOKIE, oauthStateCookieOptions);

      // 2. Check if there is an error
      if (req.query.error) {
        // 3. Redirect to the frontend with the error
        return res.redirect(frontendSignInError('google_denied'));
      }

      // 4. Check if the state is valid
      if (!code || !state || !storedState || state !== storedState) {
        // 5. Redirect to the frontend with the error
        return res.redirect(frontendSignInError('google_invalid_state'));
      }

      // 6. Login with the Google OAuth code and set the auth cookie
      const result = await authService.loginWithGoogleCode(code);
      // 7. Set the auth cookie
      setAuthCookie(res, result.token);
      // 8. Redirect to the frontend
      return res.redirect(`${env.frontendUrl}/`);
    } catch (error) {
      if (error instanceof AppError) {
        // 9. Redirect to the frontend with the error
        return res.redirect(frontendSignInError('google_auth_failed'));
      }
      return next(error);
    }
  },
};

export default authController;
