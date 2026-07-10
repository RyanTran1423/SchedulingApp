import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_OPTIONS, USER_COOKIE_NAME, COOKIE_MAX_AGE } from '@/app/lib/constants';

export type UserRole = 'manager' | 'employee';

export type UserSession = {
  id: number;
  name: string;
  role: UserRole;
};



function getUserCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  };
}

function isValidUserSession(user: unknown): user is UserSession {
  if (!user || typeof user !== 'object') {
    return false;
  }

  const possibleUser = user as UserSession;

  return (
    typeof possibleUser.id === 'number' &&
    typeof possibleUser.name === 'string' &&
    (possibleUser.role === 'manager' || possibleUser.role === 'employee')
  );
}

export async function setUserCookie(user: UserSession) {
  const cookieStore = await cookies();

  cookieStore.set(
    USER_COOKIE_NAME,
    JSON.stringify(user),
    COOKIE_OPTIONS
  );
}

export async function getUserFromCookie(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(USER_COOKIE_NAME);

  if (!userCookie) {
    return null;
  }

  try {
    const user = JSON.parse(userCookie.value);

    if (!isValidUserSession(user)) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function clearUserCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE_NAME);
}

export async function requireUserFromCookie() {
  const user = await getUserFromCookie();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function requireRoleFromCookie(role: UserRole) {
  const user = await requireUserFromCookie();

  if (user.role !== role) {
    redirect('/login');
  }

  return user;
}