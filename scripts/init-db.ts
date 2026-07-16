import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const { sql } = await import('@/app/lib/db');

  // -------------------------------------------------------
  // Organizations
  // -------------------------------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS organizations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  // -------------------------------------------------------
  // Users
  // -------------------------------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,

      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,

      role TEXT NOT NULL
        CHECK (role IN ('manager', 'employee')),

      organization_id INTEGER NOT NULL
        REFERENCES organizations(id),

      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  // -------------------------------------------------------
  // Organization roles
  // -------------------------------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS organization_roles (
      id SERIAL PRIMARY KEY,

      organization_id INTEGER NOT NULL
        REFERENCES organizations(id)
        ON DELETE CASCADE,

      name TEXT NOT NULL,
      description TEXT,

      created_at TIMESTAMP NOT NULL DEFAULT NOW(),

      CONSTRAINT unique_organization_role_name
        UNIQUE (
          organization_id,
          name
        )
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_organization_roles (
      user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

      organization_role_id INTEGER NOT NULL
        REFERENCES organization_roles(id)
        ON DELETE CASCADE,

      created_at TIMESTAMP NOT NULL DEFAULT NOW(),

      PRIMARY KEY (
        user_id,
        organization_role_id
      )
    );
  `;

  // -------------------------------------------------------
  // Employee preferred availability
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // Organization weekly working hours
  // -------------------------------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS organization_weekly_hours (
      id SERIAL PRIMARY KEY,

      organization_id INTEGER NOT NULL
        REFERENCES organizations(id)
        ON DELETE CASCADE,

      day_of_week SMALLINT NOT NULL
        CHECK (day_of_week BETWEEN 0 AND 6),

      is_closed BOOLEAN NOT NULL DEFAULT FALSE,

      start_time TIME,
      end_time TIME,

      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

      CONSTRAINT valid_organization_working_hours
        CHECK (
          (
            is_closed = TRUE
            AND start_time IS NULL
            AND end_time IS NULL
          )
          OR
          (
            is_closed = FALSE
            AND start_time IS NOT NULL
            AND end_time IS NOT NULL
            AND start_time < end_time
          )
        ),

      CONSTRAINT unique_organization_working_day
        UNIQUE (
          organization_id,
          day_of_week
        )
    );
  `;

  // -------------------------------------------------------
  // Organization staffing requirements
  // -------------------------------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS organization_role_requirements (
      id SERIAL PRIMARY KEY,

      organization_role_id INTEGER NOT NULL
        REFERENCES organization_roles(id)
        ON DELETE CASCADE,

      day_of_week SMALLINT NOT NULL
        CHECK (day_of_week BETWEEN 0 AND 6),

      start_time TIME NOT NULL,
      end_time TIME NOT NULL,

      required_count INTEGER NOT NULL
        CHECK (required_count > 0),

      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

      CONSTRAINT valid_role_requirement_time_range
        CHECK (start_time < end_time),

      CONSTRAINT unique_role_requirement_window
        UNIQUE (
          organization_role_id,
          day_of_week,
          start_time,
          end_time
        )
    );
  `;

  // -------------------------------------------------------
  // Indexes
  // -------------------------------------------------------

  await sql`
    CREATE INDEX IF NOT EXISTS
      employee_weekly_availability_user_day_idx
    ON employee_weekly_availability (
      user_id,
      day_of_week
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS
      organization_roles_organization_idx
    ON organization_roles (
      organization_id
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS
      organization_weekly_hours_org_day_idx
    ON organization_weekly_hours (
      organization_id,
      day_of_week
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS
      organization_role_requirements_role_day_idx
    ON organization_role_requirements (
      organization_role_id,
      day_of_week
    );
  `;

  console.log('Database initialized');
  process.exit(0);
}

main().catch((error) => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});