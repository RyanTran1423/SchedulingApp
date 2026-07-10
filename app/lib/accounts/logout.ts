'use server';

import { redirect } from 'next/navigation';
import { clearUserCookie } from '@/app/lib/utils/cookie';

export async function logout() {
  await clearUserCookie();

  redirect('/login');
}