'use server';

import { sql } from '@/app/lib/db';
import bcrypt from 'bcryptjs';

export async function createAccount(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const organizationName = formData.get('organization') as string;

    if (!name || !email || !password || !role || !organizationName) {
        throw new Error('All fields are required');
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

    console.log('Account created successfully');
}