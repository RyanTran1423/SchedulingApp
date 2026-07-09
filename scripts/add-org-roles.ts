// Script to update the tables in the database to use the structure from:
// https://docs.google.com/document/d/1N52iTM2r8Y2MdQWZYTqjRq5KXCqt0mPaOsKelpKEum0/edit?tab=t.cmcrorlw82wp

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { sql } = await import('@/app/lib/db');

  await sql`
    CREATE TABLE IF NOT EXISTS organization_roles (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),

      UNIQUE (organization_id, name)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_organization_roles (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      organization_role_id INTEGER NOT NULL REFERENCES organization_roles(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),

      PRIMARY KEY (user_id, organization_role_id)
    );
  `;

  console.log('Organization role tables created');
  process.exit(0);
}

main().catch((error) => {
  console.error('Failed to create organization role tables:', error);
  process.exit(1);
});