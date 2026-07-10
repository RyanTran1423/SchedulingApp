import { sql } from '@/app/lib/db';

export type OrganizationRow = {
  id: number;
  name: string;
};

export async function findOrganizationById(id: number): Promise<OrganizationRow | undefined> {
  const result = await sql`
    SELECT id, name
    FROM organizations
    WHERE id = ${id}
    LIMIT 1
  `;

  return result[0] as OrganizationRow | undefined;
}

export async function findOrganizationByName(name: string): Promise<OrganizationRow | undefined> {
  const result = await sql`
    SELECT id, name
    FROM organizations
    WHERE name = ${name}
    LIMIT 1
  `;

  return result[0] as OrganizationRow | undefined;
}

export async function createOrganization(name: string): Promise<number> {
  const result = await sql`
    INSERT INTO organizations (name)
    VALUES (${name})
    RETURNING id;
  `;

  return result[0].id as number;
}

export async function createOrGetOrganization(name: string): Promise<number> {
  const existing = await findOrganizationByName(name);

  if (existing) return existing.id;

  // Use upsert to avoid races and return the id
  const insertResult = await sql`
    INSERT INTO organizations (name)
    VALUES (${name})
    ON CONFLICT (name)
    DO UPDATE SET name = EXCLUDED.name
    RETURNING id;
  `;

  return insertResult[0].id as number;
}
