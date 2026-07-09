'use server';

import { sql } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function createAccount(formData: FormData) {
  const name = formData.get('name')?.toString().trim();
  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const role = formData.get('role')?.toString();
  const organizationName = formData.get('organization')?.toString().trim();

  if (!name || !email || !password || !role || !organizationName) {
    throw new Error('All fields are required');
  }

  if (role !== 'manager' && role !== 'employee') {
    throw new Error('Invalid role');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const orgResult = await sql`
    INSERT INTO organizations (name)
    VALUES (${organizationName})
    ON CONFLICT (name)
    DO UPDATE SET name = EXCLUDED.name
    RETURNING id;
  `;

  const organizationId = orgResult[0].id as number;

  const userResult = await sql`
    INSERT INTO users (name, email, password_hash, role, organization_id)
    VALUES (${name}, ${email}, ${passwordHash}, ${role}, ${organizationId})
    RETURNING id, name, role;
  `;

  const newUser = userResult[0] as {
    id: number;
    name: string;
    role: 'manager' | 'employee';
  };

  const cookieStore = await cookies();

  cookieStore.set(
    'user',
    JSON.stringify({
      id: newUser.id,
      name: newUser.name,
      role: newUser.role,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    }
  );

  if (newUser.role === 'manager') {
    redirect('/dashboard/manager');
  }

  redirect('/dashboard/employee');
}