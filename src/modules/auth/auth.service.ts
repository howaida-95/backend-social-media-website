import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { Op } from 'sequelize';
import User from '@modules/users/user.model';
import RefreshToken from '@modules/auth/refresh-token.model';
import { env } from '@config/env';
import { AppError } from '@utils/AppError';
import { comparePassword, hashPassword } from '@utils/password';
import {
  createRefreshTokenValue,
  getAccessTokenExpiresAtIso,
  hashRefreshToken,
  parseDurationToMs,
  signAccessToken,
} from '@utils/jwt';
import { sanitizeUser } from '@utils/sanitizeUser';
import transporter from '@utils/mailer';
import type {
  AuthResult,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SessionMeta,
} from '@modules/auth/auth.types';

const googleClient = new OAuth2Client(
  env.googleClientId,
  env.googleClientSecret,
  env.googleRedirectUri,
);

const createSession = async (
  user: User,
  meta: SessionMeta = {},
): Promise<AuthResult> => {
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = createRefreshTokenValue();
  const tokenHash = hashRefreshToken(refreshToken);

  await RefreshToken.create({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + parseDurationToMs(env.refreshTokenExpiresIn)),
    revokedAt: null,
    replacedByTokenHash: null, 
    userAgent: meta.userAgent ?? null,
    ipAddress: meta.ipAddress ?? null, 
  });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
    accessTokenExpiresAt: getAccessTokenExpiresAtIso(accessToken),
  };
};

/* 
 * Revoke all refresh tokens for a user
 * @param userId - The ID of the user
 * @returns void
 */
const revokeAllUserRefreshTokens = async (userId: number): Promise<void> => {
  await RefreshToken.update(
    { revokedAt: new Date() },
    {
      where: {
        userId,
        revokedAt: null,
      },
    },
  );
};

const buildUniqueUsername = async (email: string): Promise<string> => {
  const base =
    email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
      .slice(0, 40) || 'user';

  let username = base.length >= 3 ? base : `${base}user`;
  let suffix = 0;

  while (await User.findOne({ where: { username } })) {
    suffix += 1;
    username = `${base.slice(0, 40 - String(suffix).length)}${suffix}`;
  }

  return username;
};

const sendResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${env.frontendUrl.replace(/\/$/, '')}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: env.emailFrom,
    to: email,
    subject: 'Reset Password',
    text: `Click here to reset your password: ${resetUrl}`,
  });
};

const authService = {
  register: async (
    input: RegisterInput,
    meta?: SessionMeta,
  ): Promise<AuthResult> => {
    const existingEmail = await User.findOne({ where: { email: input.email } });
    if (existingEmail) {
      throw new AppError(409, 'Email already in use');
    }

    const existingUsername = await User.findOne({
      where: { username: input.username },
    });
    if (existingUsername) {
      throw new AppError(409, 'Username already in use');
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await User.create({
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      password: hashedPassword,
      emailVerified: true,
      provider: 'local',
      role: 'user',
      isActive: true,
    });

    return createSession(user, meta);
  },

  login: async (input: LoginInput, meta?: SessionMeta): Promise<AuthResult> => {
    const user = await User.findOne({ where: { email: input.email } });
    if (!user || !user.password || user.provider !== 'local') {
      throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordCorrect = await comparePassword(input.password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is inactive');
    }

    return createSession(user, meta);
  },

  /**
   * Rotate refresh token: validate opaque cookie value, revoke old row,
   * issue new access + refresh pair. Reuse of a revoked token revokes all sessions.
   */
  refreshToken: async (
    rawRefreshToken: string,
    meta?: SessionMeta,
  ): Promise<AuthResult> => {
    // Validate the refresh token
    const tokenHash = hashRefreshToken(rawRefreshToken);
    // Find the refresh token in the database
    const stored = await RefreshToken.findOne({ where: { tokenHash } });

    if (!stored) {
      throw new AppError(401, 'Unauthorized');
    }

    // If the token is revoked, revoke all the user's refresh tokens
    if (stored.revokedAt) {
      await revokeAllUserRefreshTokens(stored.userId);
      throw new AppError(401, 'Unauthorized');
    }

    // If the token is expired, revoke the token
    if (stored.expiresAt.getTime() <= Date.now()) {
      await stored.update({ revokedAt: new Date() });
      throw new AppError(401, 'Unauthorized');
    }

    // If the user is not active, revoke the token
    const user = await User.findByPk(stored.userId);
    if (!user || !user.isActive) {
      await stored.update({ revokedAt: new Date() });
      throw new AppError(401, 'Unauthorized');
    }
    // Create a new refresh token
    const nextRefreshToken = createRefreshTokenValue();
    // Hash the new refresh token
    const nextHash = hashRefreshToken(nextRefreshToken);

    await stored.update({
      revokedAt: new Date(),
      replacedByTokenHash: nextHash,
    });

    // Create a new refresh token in the database
    await RefreshToken.create({
      userId: user.id,
      tokenHash: nextHash,
      expiresAt: new Date(Date.now() + parseDurationToMs(env.refreshTokenExpiresIn)),
      revokedAt: null,
      replacedByTokenHash: null,
      userAgent: meta?.userAgent ?? stored.userAgent,
      ipAddress: meta?.ipAddress ?? stored.ipAddress,
    });

    const accessToken = signAccessToken(user.id, user.role);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken: nextRefreshToken,
      accessTokenExpiresAt: getAccessTokenExpiresAtIso(accessToken),
    };
  },

  logout: async (rawRefreshToken?: string): Promise<void> => {
    if (!rawRefreshToken) {
      return;
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);
    const stored = await RefreshToken.findOne({ where: { tokenHash } });
    if (stored && !stored.revokedAt) {
      await stored.update({ revokedAt: new Date() });
    }
  },

  me: async (user: User) => {
    return sanitizeUser(user);
  },

  forgotPassword: async (input: ForgotPasswordInput): Promise<void> => {
    const user = await User.findOne({
      where: {
        email: input.email,
        provider: 'local',
      },
    });

    // Always succeed to avoid email enumeration
    if (!user || !user.password) {
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await user.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
    });

    await sendResetEmail(user.email, rawToken);
  },

  resetPassword: async (input: ResetPasswordInput): Promise<void> => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(input.token)
      .digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    if (user.password) {
      const isSamePassword = await comparePassword(input.password, user.password);
      if (isSamePassword) {
        throw new AppError(
          400,
          'New password must be different from your current password',
        );
      }
    }

    const hashedPassword = await hashPassword(input.password);
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    // Invalidate all sessions after password reset
    await revokeAllUserRefreshTokens(user.id);
  },

  getGoogleAuthUrl: (state: string): string => {
    if (!env.googleClientId || !env.googleClientSecret) {
      throw new AppError(500, 'Google OAuth is not configured');
    }

    return googleClient.generateAuthUrl({
      access_type: 'online',
      prompt: 'select_account',
      scope: ['openid', 'email', 'profile'],
      state,
    });
  },

  loginWithGoogleCode: async (
    code: string,
    meta?: SessionMeta,
  ): Promise<AuthResult> => {
    if (!env.googleClientId || !env.googleClientSecret) {
      throw new AppError(500, 'Google OAuth is not configured');
    }

    let idToken: string | undefined;
    try {
      const { tokens } = await googleClient.getToken(code);
      idToken = tokens.id_token ?? undefined;
    } catch {
      throw new AppError(401, 'Google authentication failed');
    }

    if (!idToken) {
      throw new AppError(401, 'Google authentication failed');
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new AppError(401, 'Google authentication failed');
    }

    if (!payload?.sub || !payload.email) {
      throw new AppError(400, 'Invalid Google token');
    }

    const googleId = payload.sub;
    const email = payload.email;
    const firstName = payload.given_name || 'User';
    const lastName = payload.family_name || 'Google';
    const avatar = payload.picture || null;

    let user = await User.findOne({ where: { googleId } });

    if (!user) {
      user = await User.findOne({ where: { email } });

      if (user) {
        if (user.provider === 'local' && !user.googleId) {
          throw new AppError(
            400,
            'Account exists with email/password. Please login with password.',
          );
        }
        await user.update({
          googleId,
          emailVerified: true,
          avatar: user.avatar || avatar,
        });
      } else {
        const username = await buildUniqueUsername(email);
        user = await User.create({
          email,
          firstName,
          lastName,
          username,
          emailVerified: true,
          provider: 'google',
          googleId,
          avatar,
          role: 'user',
          isActive: true,
          password: null,
        });
      }
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is inactive');
    }

    return createSession(user, meta);
  },
};

export default authService;
