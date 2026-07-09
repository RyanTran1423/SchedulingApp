'use server';

import { sql } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    throw new Error('All fields are required');
  }

  const result = await sql`
    SELECT id, name, email, password_hash, role, organization_id
    FROM users
    WHERE LOWER(email) = ${email}
    LIMIT 1
  `;

  const user = result[0] as {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: 'manager' | 'employee';
    organization_id: number;
  } | undefined;

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

  const cookieStore = await cookies();

  cookieStore.set(
    'user',
    JSON.stringify({
      id: user.id,
      name: user.name,
      role: user.role,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    }
  );

  if (user.role === 'manager') {
    redirect('/dashboard/manager');
  }

  redirect('/dashboard/employee');
}