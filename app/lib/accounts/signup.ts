'use server';

import { sql } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { setUserCookie } from '@/app/lib/utils/cookie';
import {
  isValidEmail,
  isValidPassword,
  isValidUserRole,
} from '@/app/lib/utils/validation';

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

  if (!isValidPassword(password)) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (!isValidUserRole(role)) {
    throw new Error('Invalid role');
  }

  const existingUser = await sql`
    SELECT id
    FROM users
    WHERE LOWER(email) = ${email}
    LIMIT 1;
  `;

  if (existingUser.length > 0) {
    throw new Error('An account with this email already exists');
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