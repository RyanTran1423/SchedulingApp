'use server';

import { sql } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function createAccount(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const organizationName = formData.get('organization') as string;

    if (!name || !email || !password || !role || !organizationName) {
        throw new Error('All fields are required');
    }

    if(!isValidEmail(email)) {
        throw new Error('Please enter a valid email address')
    }

    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
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

    const orgResult = await sql `
        INSERT INTO organizations (name)
        VALUES (${organizationName})
        ON CONFLICT (name)
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
    `;

    const organizationId = orgResult[0].id; // Extract id from first row in query result and store it in organizationId

    await sql `
        INSERT INTO users (name, email, password_hash, role, organization_id)
        VALUES (${name}, ${email}, ${passwordHash}, ${role}, ${organizationId});
    `;

    if (role == 'manager') {
        redirect('/dashboard/manager');
    } else {
        redirect('/dashboard/employee');
    }

    console.log('Account created successfully');
}