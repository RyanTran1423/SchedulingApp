import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { sql } = await import('@/app/lib/db');

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
        UNIQUE (organization_id, day_of_week)
    );
    `;
    console.log('Organization weekly hours table created');
    process.exit(0);
}
main().catch((error) => {
  console.error('Failed to create organization role tables:', error);
  process.exit(1);
});