export const USER_COOKIE_NAME = 'user';

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: COOKIE_MAX_AGE,
  path: '/',
};

export const PASSWORD_MIN_LENGTH = 8;

export const BCRYPT_SALT_ROUNDS = 10;