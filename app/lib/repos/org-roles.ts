// Repo layer file. Responsibility is to communicate directly with tables like organization_roles
// Each funciton represents a database operation

import { sql } from '@/app/lib/db';

export type OrganizationRoleRow = {
  id: number;
  organization_id: number;
  name: string;
  description: string | null;
  employees: {
    id: number;
    name: string;
  }[];
};

export async function findOrganizationRoles(
  organizationId: number,
): Promise<OrganizationRoleRow[]> {
  const result = await sql<OrganizationRoleRow[]>`
    SELECT
      organization_roles.id,
      organization_roles.organization_id,
      organization_roles.name,
      organization_roles.description,
      COALESCE(
        json_agg(
          json_build_object(
            'id', users.id,
            'name', users.name
          )
        ) FILTER (WHERE users.id IS NOT NULL),
        '[]'
      ) AS employees

    FROM organization_roles

    LEFT JOIN user_organization_roles
      ON organization_roles.id = user_organization_roles.organization_role_id

    LEFT JOIN users
      ON user_organization_roles.user_id = users.id

    WHERE organization_roles.organization_id = ${organizationId}

    GROUP BY organization_roles.id

    ORDER BY organization_roles.name ASC;
  `;

  return result;
}

export async function findOrganizationRoleByName(
  organizationId: number,
  name: string,
): Promise<OrganizationRoleRow | undefined> {
  const result = await sql<OrganizationRoleRow[]>`
    SELECT
      id,
      organization_id,
      name,
      description
    FROM organization_roles
    WHERE organization_id = ${organizationId}
      AND LOWER(name) = LOWER(${name})
    LIMIT 1;
  `;

  return result[0];
}

export async function createOrganizationRoleRecord(
  organizationId: number,
  name: string,
  description?: string,
): Promise<OrganizationRoleRow> {
  const result = await sql<OrganizationRoleRow[]>`
    INSERT INTO organization_roles (
      organization_id,
      name,
      description
    )
    VALUES (
      ${organizationId},
      ${name},
      ${description || null}
    )
    RETURNING
      id,
      organization_id,
      name,
      description;
  `;

  const createdRole = result[0];

  if (!createdRole) {
    throw new Error('Failed to create organization role.');
  }

  return createdRole;
}

export async function deleteOrganizationRoleRecord(
  organizationId: number,
  roleId: number,
): Promise<boolean> {
  const result = await sql<{ id: number }[]>`
    DELETE FROM organization_roles
    WHERE id = ${roleId}
      AND organization_id = ${organizationId}
    RETURNING id;
  `;

  return result.length > 0;
}