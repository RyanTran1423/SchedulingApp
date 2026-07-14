import 'server-only';

import { redirect } from 'next/navigation';
import { sql } from '@/app/lib/db';
import {
  assertSameOrganization,
  requireUser,
  type AuthenticatedUser,
} from '@/app/lib/utils/auth/require-user';

export type ManagerUser = AuthenticatedUser & {
  role: 'manager';
};

type EmployeeOrganizationRecord = {
  id: number;
  role: string;
  organization_id: number;
};

export async function requireManager(): Promise<ManagerUser> {
  const user = await requireUser();

  if (user.role !== 'manager') {
    redirect('/dashboard/employee');
  }

  return {
    ...user,
    role: 'manager',
  };
}

export async function requireManagerForOrganization(
  organizationId: number
): Promise<ManagerUser> {
  const manager = await requireManager();

  assertSameOrganization(manager, organizationId);

  return manager;
}

export async function requireManagerCanModifyEmployee(
  employeeId: number
): Promise<ManagerUser> {
  const manager = await requireManager();

  const result = await sql`
    SELECT id, role, organization_id
    FROM users
    WHERE id = ${employeeId}
    LIMIT 1;
  `;

  const employee = result[0] as EmployeeOrganizationRecord | undefined;

  if (!employee || employee.role !== 'employee') {
    throw new Error('Employee record not found.');
  }

  assertSameOrganization(manager, employee.organization_id);

  return manager;
}