import { redirect } from 'next/navigation';
import { sql } from '@/app/lib/db';
import { getUser } from '@/app/lib/accounts/get-user';

export async function requireManager() {
  const cookieUser = await getUser();

  if (!cookieUser) {
    redirect('/login');
  }

  const result = await sql`
    SELECT id, name, email, role, organization_id
    FROM users
    WHERE id = ${cookieUser.id}
    LIMIT 1;
  `;

  const user = result[0] as
    | {
        id: number;
        name: string;
        email: string;
        role: string;
        organization_id: number;
      }
    | undefined;

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'manager') {
    redirect('/dashboard/employee');
  }

  return user;
}