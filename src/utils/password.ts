import bcrypt from 'bcrypt';

// SALT_ROUNDS is used to set the number of salt rounds for the password
const SALT_ROUNDS = 12;

// hashPassword is used to hash the password for the user
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// comparePassword is used to compare the password for the user
export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
