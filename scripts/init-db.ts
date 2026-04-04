
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { sql } = await import('@/app/lib/db');

  await sql`
    CREATE TABLE IF NOT EXISTS organizations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('manager', 'employee')),
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  console.log('Database initialized');
  process.exit(0);
}

main().catch((error) => {
  console.error('Init failed:', error);
  process.exit(1);
});