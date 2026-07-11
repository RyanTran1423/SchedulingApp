import { sql } from '@/app/lib/db';

export type EmployeeAvailabilityRow = {
  id: number;
  user_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: Date;
  updated_at: Date;
};

export type AvailabilityWindowInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

/**
 * Returns all recurring weekly availability windows for one employee.
 */
export async function findWeeklyAvailability(
  userId: number,
): Promise<EmployeeAvailabilityRow[]> {
  const result = await sql<EmployeeAvailabilityRow[]>`
    SELECT
      id,
      user_id,
      day_of_week,
      start_time,
      end_time,
      created_at,
      updated_at
    FROM employee_weekly_availability
    WHERE user_id = ${userId}
    ORDER BY
      day_of_week ASC,
      start_time ASC;
  `;

  return result;
}

/**
 * Replaces an employee's entire weekly availability.
 *
 * The delete and inserts run inside one transaction so that the employee
 * cannot be left with partially updated availability if an insert fails.
 */
export async function replaceWeeklyAvailability(
  userId: number,
  windows: AvailabilityWindowInput[],
): Promise<EmployeeAvailabilityRow[]> {
  return sql.begin(async (transaction) => {
    await transaction`
      DELETE FROM employee_weekly_availability
      WHERE user_id = ${userId};
    `;

    const insertedRows: EmployeeAvailabilityRow[] = [];

    for (const window of windows) {
      const result = await transaction<EmployeeAvailabilityRow[]>`
        INSERT INTO employee_weekly_availability (
          user_id,
          day_of_week,
          start_time,
          end_time
        )
        VALUES (
          ${userId},
          ${window.dayOfWeek},
          ${window.startTime},
          ${window.endTime}
        )
        RETURNING
          id,
          user_id,
          day_of_week,
          start_time,
          end_time,
          created_at,
          updated_at;
      `;

      const insertedRow = result[0];

      if (!insertedRow) {
        throw new Error('Failed to save an availability window.');
      }

      insertedRows.push(insertedRow);
    }

    return insertedRows;
  });
}

/**
 * Removes all recurring weekly availability for one employee.
 */
export async function clearWeeklyAvailability(
  userId: number,
): Promise<void> {
  await sql`
    DELETE FROM employee_weekly_availability
    WHERE user_id = ${userId};
  `;
}