'use server';

import { findUserByEmail } from '@/app/lib/repos/users';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { setUserCookie } from '@/app/lib/utils/cookie';

export async function login(formData: FormData) {
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    throw new Error('All fields are required');
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  if (user.role !== 'manager' && user.role !== 'employee') {
    throw new Error('Invalid user role');
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