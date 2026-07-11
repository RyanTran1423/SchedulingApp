// Script to update DB to include employee availability table

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const { sql } = await import('@/app/lib/db');

  await sql`
    CREATE TABLE IF NOT EXISTS employee_weekly_availability (
      id SERIAL PRIMARY KEY,

      user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

      day_of_week SMALLINT NOT NULL
        CHECK (day_of_week BETWEEN 0 AND 6),

      start_time TIME NOT NULL,
      end_time TIME NOT NULL,

      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

      CONSTRAINT valid_availability_time_range
        CHECK (start_time < end_time),

      CONSTRAINT unique_employee_availability_window
        UNIQUE (
          user_id,
          day_of_week,
          start_time,
          end_time
        )
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS
      employee_weekly_availability_user_day_idx
    ON employee_weekly_availability (
      user_id,
      day_of_week
    );
  `;

  console.log('Employee weekly availability table created');
  process.exit(0);
}

main().catch((error) => {
  console.error(
    'Failed to create employee weekly availability table:',
    error,
  );

  process.exit(1);
});