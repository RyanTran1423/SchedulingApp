'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { findUserByEmail } from '@/app/lib/repos/users';
import { setUserCookie } from '@/app/lib/utils/cookie';

export type LoginActionState = {
  error?: string;
};

export async function login(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = formData
    .get('email')
    ?.toString()
    .trim()
    .toLowerCase();

  const password = formData
    .get('password')
    ?.toString();

  if (!email || !password) {
    return {
      error: 'Please enter both your email and password.',
    };
  }

  const user = await findUserByEmail(email);

  /*
   * Use the same message for an incorrect email and password.
   * This avoids revealing whether a particular email exists.
   */
  if (!user) {
    return {
      error: 'Incorrect email or password.',
    };
  }

  const isValidPassword = await bcrypt.compare(
    password,
    user.password_hash,
  );

  if (!isValidPassword) {
    return {
      error: 'Incorrect email or password.',
    };
  }

  if (
    user.role !== 'manager' &&
    user.role !== 'employee'
  ) {
    return {
      error: 'This account does not have a valid user role.',
    };
  }

  await setUserCookie({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  if (user.role === 'manager') {
    redirect('/dashboard/manager');
  }

  redirect('/dashboard/employee');
}