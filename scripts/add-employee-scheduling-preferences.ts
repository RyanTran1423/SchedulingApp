import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const { sql } = await import('@/app/lib/db');

  await sql`
    CREATE TABLE IF NOT EXISTS employee_scheduling_preferences (
      id SERIAL PRIMARY KEY,

      user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

      preferred_weekly_hours NUMERIC(4, 1) NOT NULL
        CHECK (
          preferred_weekly_hours >= 0
          AND preferred_weekly_hours <= 80
        ),

      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

      CONSTRAINT unique_employee_scheduling_preference
        UNIQUE (user_id)
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS employee_scheduling_preferences_user_idx
    ON employee_scheduling_preferences (
      user_id
    );
  `;

  console.log('Employee scheduling preferences table created');
  process.exit(0);
}

main().catch((error) => {
  console.error(
    'Failed to create employee scheduling preferences table:',
    error,
  );
  process.exit(1);
});