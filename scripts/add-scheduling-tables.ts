// Script to update DB to include scheduling tables:
// - shifts
// - shift_sub_requests

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const { sql } = await import('@/app/lib/db');

  await sql`
    CREATE TABLE IF NOT EXISTS shifts (
      id SERIAL PRIMARY KEY,

      organization_id INTEGER NOT NULL
        REFERENCES organizations(id)
        ON DELETE CASCADE,

      employee_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

      organization_role_id INTEGER
        REFERENCES organization_roles(id)
        ON DELETE SET NULL,

      shift_date DATE NOT NULL,

      start_time TIME NOT NULL,
      end_time TIME NOT NULL,

      status TEXT NOT NULL DEFAULT 'scheduled'
        CHECK (
          status IN (
            'scheduled',
            'sub_requested',
            'covered',
            'cancelled'
          )
        ),

      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

      CONSTRAINT valid_shift_time_range
        CHECK (start_time < end_time)
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS shifts_org_date_idx
    ON shifts (
      organization_id,
      shift_date
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS shifts_employee_date_idx
    ON shifts (
      employee_id,
      shift_date
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS shift_sub_requests (
      id SERIAL PRIMARY KEY,

      shift_id INTEGER NOT NULL
        REFERENCES shifts(id)
        ON DELETE CASCADE,

      requested_by_user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

      picked_up_by_user_id INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

      status TEXT NOT NULL DEFAULT 'open'
        CHECK (
          status IN (
            'open',
            'picked_up',
            'approved',
            'denied',
            'cancelled'
          )
        ),

      reason TEXT,

      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS shift_sub_requests_status_idx
    ON shift_sub_requests (
      status
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS shift_sub_requests_shift_idx
    ON shift_sub_requests (
      shift_id
    );
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS shift_sub_requests_active_shift_idx
    ON shift_sub_requests (
      shift_id
    )
    WHERE status IN (
      'open',
      'picked_up'
    );
  `;

  console.log('Scheduling tables created');
  process.exit(0);
}

main().catch((error) => {
  console.error('Failed to create scheduling tables:', error);
  process.exit(1);
});