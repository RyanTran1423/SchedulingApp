'use server';

import { cookies } from 'next/headers';

type UserSession = {
  id: number;
  name: string;
  role: 'manager' | 'employee';
};

export async function getUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');

  if (!userCookie) {
    return null;
  }

  try {
    const user = JSON.parse(userCookie.value);

    if (
      typeof user.id !== 'number' ||
      typeof user.name !== 'string' ||
      (user.role !== 'manager' && user.role !== 'employee')
    ) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}