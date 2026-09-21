import { Router } from 'express';
import authController from '@modules/auth/auth.controller';
import { authenticate } from '@middlewares/auth.middleware';
import { authLimiter, forgotPasswordLimiter } from '@middlewares/rate-limit.middleware';
import { validateBody } from '@middlewares/validate.middleware';
import {
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@modules/auth/auth.validation';

const authRoutes = Router();

authRoutes.post('/register', authLimiter, validateBody(registerSchema), authController.register);
authRoutes.post('/login', authLimiter, validateBody(loginSchema), authController.login);
authRoutes.post('/logout', authController.logout);
authRoutes.post('/refresh-token', authController.refreshToken);
authRoutes.get('/me', authenticate, authController.me);
authRoutes.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);
authRoutes.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);
authRoutes.post('/google', validateBody(googleLoginSchema), authController.googleLogin);

export default authRoutes;
