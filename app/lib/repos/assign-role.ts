import { sql } from '@/app/lib/db';

export async function assignEmployeeToRole(
  userId: number,
  organizationRoleId: number,
) {
  await sql`
    INSERT INTO user_organization_roles (
      user_id,
      organization_role_id
    )
    VALUES (
      ${userId},
      ${organizationRoleId}
    );
  `;
}