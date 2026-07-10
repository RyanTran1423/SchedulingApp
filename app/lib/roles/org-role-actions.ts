// app/lib/roles/org-role-actions.ts

'use server';

import { sql } from '@/app/lib/db';
import { revalidatePath } from 'next/cache';
import { requireManager } from '@/app/lib/utils/auth/require-manager';

type RoleActionState = {
  error?: string;
  success?: string;
};

export async function createOrganizationRole(
  previousState: RoleActionState,
  formData: FormData
): Promise<RoleActionState> {
  const manager = await requireManager();

  const name = formData.get('name')?.toString().trim();
  const description = formData.get('description')?.toString().trim();

  if (!name) {
    return {
      error: 'Role name is required.',
    };
  }

  const existingRole = await sql`
    SELECT id
    FROM organization_roles
    WHERE organization_id = ${manager.organization_id}
    AND LOWER(name) = LOWER(${name})
    LIMIT 1;
  `;

  if (existingRole.length > 0) {
    return {
      error: 'That role already exists.',
    };
  }

  await sql`
    INSERT INTO organization_roles (organization_id, name, description)
    VALUES (${manager.organization_id}, ${name}, ${description || null});
  `;

  revalidatePath('/dashboard/manager/set-org-roles');

  return {
    success: 'Role added successfully.',
  };
}

export async function deleteOrganizationRole(formData: FormData) {
  const manager = await requireManager();

  const roleId = Number(formData.get('roleId'));

  if (!roleId) {
    throw new Error('Role id is required.');
  }

  await sql`
    DELETE FROM user_organization_roles
    WHERE organization_role_id = ${roleId};
  `;

  await sql`
    DELETE FROM organization_roles
    WHERE id = ${roleId}
    AND organization_id = ${manager.organization_id};
  `;

  revalidatePath('/dashboard/manager/set-org-roles');
}