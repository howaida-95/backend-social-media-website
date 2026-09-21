import User from '@modules/users/user.model';
import type { PublicUser } from '@modules/auth/auth.types';

/*
It strips sensitive fields from a User before sending it to the client.
This is used to prevent sensitive information from being leaked to the client.
*/
export const sanitizeUser = (user: User): PublicUser => {
  const json = user.toJSON() as Record<string, unknown>;
  delete json.password;
  delete json.resetPasswordToken;
  delete json.resetPasswordExpires;
  return json as PublicUser;
};
