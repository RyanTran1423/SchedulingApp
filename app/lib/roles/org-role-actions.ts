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
import { assignEmployeeToRole } from '@/app/lib/repos/assign-role';

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
  const employeeId = Number(formData.get('employeeId'));

  if (!isValidOrganizationRoleName(name)) {
    return {
      error: 'Role name is required.',
    };
  }

  // validates employee id

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
  return {
    error: 'Please select an employee.',
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

  const createdRole =await createOrganizationRoleRecord(
    manager.organization_id,
    name,
    description,
  );

  // assign the role to the employee if an employee is selected
  await assignEmployeeToRole(
  manager.organization_id,
  employeeId,
  createdRole.id,
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

// function to assign role to employee

export async function assignEmployeeRole(
  formData: FormData,
) {
  const manager = await requireManager();

  const employeeId = Number(
    formData.get('employeeId')
  );

  const roleId = Number(
    formData.get('roleId')
  );


  if (
    !Number.isInteger(employeeId) ||
    employeeId <= 0
  ) {
    throw new Error('A valid employee id is required.');
  }


  if (
    !Number.isInteger(roleId) ||
    roleId <= 0
  ) {
    throw new Error('A valid role id is required.');
  }


  await assignEmployeeToRole(
    manager.organization_id,
    employeeId,
    roleId,
  );


  revalidatePath(
    '/dashboard/manager/set-org-roles'
  );
}