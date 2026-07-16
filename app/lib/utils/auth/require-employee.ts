import 'server-only';

import { redirect } from 'next/navigation';
import {
  assertSameOrganization,
  requireUser,
  type AuthenticatedUser,
} from '@/app/lib/utils/auth/require-user';

export type EmployeeUser = AuthenticatedUser & {
  role: 'employee';
};

export async function requireEmployee(): Promise<EmployeeUser> {
  const user = await requireUser();

  if (user.role !== 'employee') {
    redirect('/dashboard/manager');
  }

  return {
    ...user,
    role: 'employee',
  };
}

export async function requireEmployeeForOrganization(
  organizationId: number
): Promise<EmployeeUser> {
  const employee = await requireEmployee();

  assertSameOrganization(employee, organizationId);

  return employee;
}