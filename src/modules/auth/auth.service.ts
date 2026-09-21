import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { Op } from 'sequelize';
import User from '@modules/users/user.model';
import { env } from '@config/env';
import { AppError } from '@utils/AppError';
import { comparePassword, hashPassword } from '@utils/password';
import { signToken, verifyToken } from '@utils/jwt';
import { sanitizeUser } from '@utils/sanitizeUser';
import transporter from '@utils/mailer';
import type {
  AuthResult,
  ForgotPasswordInput,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '@modules/auth/auth.types';

const googleClient = new OAuth2Client(env.googleClientId);

const buildAuthResult = (user: User): AuthResult => ({
  user: sanitizeUser(user),
  token: signToken(user.id, user.role),
});

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
  register: async (input: RegisterInput): Promise<AuthResult> => {
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

    return buildAuthResult(user);
  },

  login: async (input: LoginInput): Promise<AuthResult> => {
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

    return buildAuthResult(user);
  },

  refreshToken: async (token: string): Promise<AuthResult> => {
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new AppError(401, 'Unauthorized');
    }

    if (!decoded.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError(401, 'Unauthorized');
    }

    return buildAuthResult(user);
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

    const hashedPassword = await hashPassword(input.password);
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  },

  googleLogin: async (input: GoogleLoginInput): Promise<AuthResult> => {
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: input.credential,
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

    return buildAuthResult(user);
  },
};

export default authService;
