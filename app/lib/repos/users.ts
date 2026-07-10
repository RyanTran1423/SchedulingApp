import { sql } from '@/app/lib/db';

export type UserRole = 'manager' | 'employee';

export type UserRow = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  organization_id: number;
};

export type CreatedUser = {
  id: number;
  name: string;
  role: UserRole;
};

export type CreateUserParams = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  organizationId: number;
};

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const result = await sql`
    SELECT id, name, email, password_hash, role, organization_id
    FROM users
    WHERE LOWER(email) = ${email.toLowerCase()}
    LIMIT 1
  `;

  return result[0] as UserRow | undefined;
}

export async function createUser(params: CreateUserParams): Promise<CreatedUser> {
  const result = await sql`
    INSERT INTO users (name, email, password_hash, role, organization_id)
    VALUES (${params.name}, ${params.email}, ${params.passwordHash}, ${params.role}, ${params.organizationId})
    RETURNING id, name, role;
  `;

  return result[0] as CreatedUser;
}
