export const USER_COOKIE_NAME = 'user';

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: COOKIE_MAX_AGE,
  path: '/',
};
