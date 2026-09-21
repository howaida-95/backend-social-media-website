import { NextFunction, Request, Response } from 'express';
import authService from '@modules/auth/auth.service';
import { clearAuthCookie, COOKIE_NAME, setAuthCookie } from '@utils/jwt';
import { AppError } from '@utils/AppError';

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

  googleLogin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.googleLogin(req.body);
      setAuthCookie(res, result.token);
      return res.status(200).json({
        message: 'Google login successful',
        user: result.user,
      });
    } catch (error) {
      return next(error);
    }
  },
};

export default authController;
