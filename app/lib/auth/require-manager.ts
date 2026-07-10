import { redirect } from 'next/navigation';
import { sql } from '@/app/lib/db';
import { requireUserFromCookie } from '@/app/lib/utils/cookie';

type ManagerUser = {
  id: number;
  name: string;
  email: string;
  role: 'manager';
  organization_id: number;
};

type DbUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  organization_id: number;
};

export async function requireManager(): Promise<ManagerUser> {
  const cookieUser = await requireUserFromCookie();

  const result = await sql`
    SELECT id, name, email, role, organization_id
    FROM users
    WHERE id = ${cookieUser.id}
    LIMIT 1;
  `;

  const user = result[0] as DbUser | undefined;

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'manager') {
    redirect('/dashboard/employee');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'manager',
    organization_id: user.organization_id,
  };
}