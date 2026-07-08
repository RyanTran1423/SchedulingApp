'use server';

console.log("LOGIN STARTED");

import { sql } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const userResult = await sql `
        SELECT * FROM users WHERE email = ${email};
    `;

    const user = userResult[0];

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    if (user.role === 'manager') {
        redirect('/dashboard/manager');
    } else {
        redirect('/dashboard/employee');
    }
}