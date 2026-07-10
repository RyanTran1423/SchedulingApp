// This file works with organization_roles and user_organization_roles tables. It's a server action file.
// Server action: Receives request from UI and coordinates everything to complete that request

'use server';

import { revalidatePath } from 'next/cache';
import {
  createOrganizationRoleRecord,
  deleteOrganizationRoleRecord,
  findOrganizationRoleByName,
} from '@/app/lib/repos/org-roles';
import { requireManager } from '@/app/lib/utils/auth/require-manager';
import { isValidOrganizationRoleName } from '@/app/lib/utils/validation';

type RoleActionState = {
  error?: string;
  success?: string;
};

export async function createOrganizationRole(
  previousState: RoleActionState,
  formData: FormData,
): Promise<RoleActionState> {
  const manager = await requireManager();

  const name = formData.get('name')?.toString().trim();
  const description = formData.get('description')?.toString().trim();

  if (!isValidOrganizationRoleName(name)) {
    return {
      error: 'Role name is required.',
    };
  }

  const existingRole = await findOrganizationRoleByName(
    manager.organization_id,
    name,
  );

  if (existingRole) {
    return {
      error: 'That role already exists.',
    };
  }

  await createOrganizationRoleRecord(
    manager.organization_id,
    name,
    description,
  );

  revalidatePath('/dashboard/manager/set-org-roles');

  return {
    success: 'Role added successfully.',
  };
}

export async function deleteOrganizationRole(formData: FormData) {
  const manager = await requireManager();
  const roleId = Number(formData.get('roleId'));

  if (!Number.isInteger(roleId) || roleId <= 0) {
    throw new Error('A valid role id is required.');
  }

  const deleted = await deleteOrganizationRoleRecord(
    manager.organization_id,
    roleId,
  );

  if (!deleted) {
    throw new Error(
      'The role was not found or does not belong to your organization.',
    );
  }

  revalidatePath('/dashboard/manager/set-org-roles');
}