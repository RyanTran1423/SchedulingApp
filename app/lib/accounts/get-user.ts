'use server';

import { getUserFromCookie } from '@/app/lib/utils/cookie';

export async function getUser() {
  return getUserFromCookie();
}