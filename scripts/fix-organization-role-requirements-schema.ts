import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const { sql } = await import('@/app/lib/db');

  await sql`
    ALTER TABLE organization_role_requirements
    ADD COLUMN IF NOT EXISTS organization_id INTEGER;
  `;

  await sql`
    UPDATE organization_role_requirements requirement
    SET organization_id = role.organization_id
    FROM organization_roles role
    WHERE requirement.organization_role_id = role.id
      AND requirement.organization_id IS NULL;
  `;

  await sql`
    ALTER TABLE organization_role_requirements
    ALTER COLUMN organization_id SET NOT NULL;
  `;

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'organization_role_requirements_organization_id_fkey'
      ) THEN
        ALTER TABLE organization_role_requirements
        ADD CONSTRAINT organization_role_requirements_organization_id_fkey
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE;
      END IF;
    END $$;
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS organization_role_requirements_org_day_idx
    ON organization_role_requirements (
      organization_id,
      day_of_week
    );
  `;

  console.log('Organization role requirements schema fixed');
  process.exit(0);
}

main().catch((error) => {
  console.error('Failed to fix organization role requirements schema:', error);
  process.exit(1);
});