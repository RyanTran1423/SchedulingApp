'use server';

import { sql } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation'; 

export async function login (formData: FormData) {
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
        throw new Error('All fields are required');
    }

  const result = await sql `
    SELECT id, email, password_hash, role, organization_id
    FROM users
    WHERE LOWER(email) = ${email}
    LIMIT 1
  `;

  const user = result[0] as {
    id: number;
    email: string;
    password_hash: string;
    role: string;
    organization_id: number;
  } | undefined;

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error('Invalid password');
  }

  if (user.role == 'manager') {
    redirect('/dashboard/manager');
  } else {
    redirect('/dashboard/employee');
  }

}