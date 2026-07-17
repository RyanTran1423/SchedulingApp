import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { sql } = await import('@/app/lib/db');

  await sql`
    CREATE TABLE IF NOT EXISTS organization_role_requirements (
    id SERIAL PRIMARY KEY,

    organization_id INTEGER NOT NULL
        REFERENCES organizations(id)
        ON DELETE CASCADE,

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

    CONSTRAINT valid_role_requirement_time
        CHECK (start_time < end_time),

    
    CONSTRAINT unique_role_requirement_window
        UNIQUE (
        organization_id,
        organization_role_id,
        day_of_week,
        start_time,
        end_time
        )
    
    );
    `;
    console.log('Organization role tables created');
    process.exit(0);
}
main().catch((error) => {
  console.error('Failed to create organization role tables:', error);
  process.exit(1);
});