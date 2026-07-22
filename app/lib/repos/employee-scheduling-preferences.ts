import { sql } from '@/app/lib/db';

export type EmployeeSchedulingPreferenceRow = {
  id: number;
  user_id: number;
  preferred_weekly_hours: string;
  created_at: Date;
  updated_at: Date;
};

export async function findEmployeeSchedulingPreference(
  userId: number,
): Promise<EmployeeSchedulingPreferenceRow | undefined> {
  const result = await sql<EmployeeSchedulingPreferenceRow[]>`
    SELECT
      id,
      user_id,
      preferred_weekly_hours,
      created_at,
      updated_at
    FROM employee_scheduling_preferences
    WHERE user_id = ${userId}
    LIMIT 1;
  `;

  return result[0];
}

export async function upsertEmployeeSchedulingPreference({
  userId,
  preferredWeeklyHours,
}: {
  userId: number;
  preferredWeeklyHours: number;
}): Promise<EmployeeSchedulingPreferenceRow> {
  const result = await sql<EmployeeSchedulingPreferenceRow[]>`
    INSERT INTO employee_scheduling_preferences (
      user_id,
      preferred_weekly_hours
    )
    VALUES (
      ${userId},
      ${preferredWeeklyHours}
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      preferred_weekly_hours = EXCLUDED.preferred_weekly_hours,
      updated_at = NOW()
    RETURNING
      id,
      user_id,
      preferred_weekly_hours,
      created_at,
      updated_at;
  `;

  const preference = result[0];

  if (!preference) {
    throw new Error('Failed to save preferred weekly hours.');
  }

  return preference;
}