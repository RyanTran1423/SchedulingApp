'use server';

import { createUser, findUserByEmail } from '@/app/lib/repos/users';
import { createOrGetOrganization } from '@/app/lib/repos/organizations';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { setUserCookie } from '@/app/lib/utils/cookie';
<<<<<<< HEAD
import { BCRYPT_SALT_ROUNDS, PASSWORD_MIN_LENGTH } from '@/app/lib/constants';

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
=======
import {
  isValidEmail,
  isValidPassword,
  isValidUserRole,
} from '@/app/lib/utils/validation';
>>>>>>> 428da33542a926f3899e8ddb6f1cc35f8000aafe

export async function createAccount(formData: FormData) {
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const role = formData.get('role')?.toString();
  const organizationName = formData.get('organization')?.toString().trim();

  if (!name || !email || !password || !role || !organizationName) {
    throw new Error('All fields are required');
  }

  if (!isValidEmail(email)) {
    throw new Error('Please enter a valid email address');
  }

<<<<<<< HEAD
  if (password.length < PASSWORD_MIN_LENGTH) {
=======
  if (!isValidPassword(password)) {
>>>>>>> 428da33542a926f3899e8ddb6f1cc35f8000aafe
    throw new Error('Password must be at least 8 characters long');
  }

  if (!isValidUserRole(role)) {
    throw new Error('Invalid role');
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const organizationId = await createOrGetOrganization(organizationName);

  const newUser = await createUser({
    name,
    email,
    passwordHash,
    role: role as 'manager' | 'employee',
    organizationId,
  });

  await setUserCookie({
    id: newUser.id,
    name: newUser.name,
    role: newUser.role,
  });

  if (newUser.role === 'manager') {
    redirect('/dashboard/manager');
  }

  redirect('/dashboard/employee');
}