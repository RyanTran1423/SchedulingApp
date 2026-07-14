import 'server-only';

import { redirect } from 'next/navigation';
import { sql } from '@/app/lib/db';
import { requireUserFromCookie } from '@/app/lib/utils/cookie';

export type AppRole = 'manager' | 'employee';

export type DbUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  organization_id: number;
};

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  role: AppRole;
  organization_id: number;
};

function isAppRole(role: string): role is AppRole {
  return role === 'manager' || role === 'employee';
}

async function findCurrentUserFromDatabase(): Promise<AuthenticatedUser | null> {
  const cookieUser = await requireUserFromCookie();

  const result = await sql`
    SELECT id, name, email, role, organization_id
    FROM users
    WHERE id = ${cookieUser.id}
    LIMIT 1;
  `;

  const user = result[0] as DbUser | undefined;

  if (!user) {
    return null;
  }

  if (!isAppRole(user.role)) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
  };
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await findCurrentUserFromDatabase();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export function assertSameOrganization(
  user: AuthenticatedUser,
  organizationId: number
) {
  if (user.organization_id !== organizationId) {
    throw new Error('You do not have permission to modify this record.');
  }
}

export async function requireUserForOrganization(
  organizationId: number
): Promise<AuthenticatedUser> {
  const user = await requireUser();

  assertSameOrganization(user, organizationId);

  return user;
}