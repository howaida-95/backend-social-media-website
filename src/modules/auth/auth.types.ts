import type { JwtPayload } from 'jsonwebtoken';

export type AuthJwtPayload = JwtPayload & {
  userId: number;
  role: string;
};

export type PublicUser = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  emailVerified: boolean;
  provider: 'google' | 'local' | null;
  googleId: string | null;
  avatar: string | null;
  bio: string | null;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthResult = {
  user: PublicUser;
  token: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};
