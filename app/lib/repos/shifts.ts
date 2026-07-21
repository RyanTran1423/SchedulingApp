import { sql } from '@/app/lib/db';

export type ShiftStatus =
  | 'scheduled'
  | 'sub_requested'
  | 'covered'
  | 'cancelled';

export type ShiftRow = {
  id: number;
  organization_id: number;
  employee_id: number;
  organization_role_id: number | null;
  shift_date: string | Date;
  start_time: string;
  end_time: string;
  status: ShiftStatus;
  created_at: Date;
  updated_at: Date;
};

export async function findEmployeeShiftsInDateRange({
  employeeId,
  startDate,
  endDate,
}: {
  employeeId: number;
  startDate: string;
  endDate: string;
}): Promise<ShiftRow[]> {
  const result = await sql<ShiftRow[]>`
    SELECT
      id,
      organization_id,
      employee_id,
      organization_role_id,
      shift_date,
      start_time,
      end_time,
      status,
      created_at,
      updated_at
    FROM shifts
    WHERE employee_id = ${employeeId}
    AND shift_date >= ${startDate}
    AND shift_date <= ${endDate}
    ORDER BY
      shift_date ASC,
      start_time ASC;
  `;

  return result;
}

export async function findOrganizationShiftsInDateRange({
  organizationId,
  startDate,
  endDate,
}: {
  organizationId: number;
  startDate: string;
  endDate: string;
}): Promise<ShiftRow[]> {
  const result = await sql<ShiftRow[]>`
    SELECT
      id,
      organization_id,
      employee_id,
      organization_role_id,
      shift_date,
      start_time,
      end_time,
      status,
      created_at,
      updated_at
    FROM shifts
    WHERE organization_id = ${organizationId}
    AND shift_date >= ${startDate}
    AND shift_date <= ${endDate}
    ORDER BY
      shift_date ASC,
      start_time ASC;
  `;

  return result;
}

export async function findShiftById(
  shiftId: number,
): Promise<ShiftRow | undefined> {
  const result = await sql<ShiftRow[]>`
    SELECT
      id,
      organization_id,
      employee_id,
      organization_role_id,
      shift_date,
      start_time,
      end_time,
      status,
      created_at,
      updated_at
    FROM shifts
    WHERE id = ${shiftId}
    LIMIT 1;
  `;

  return result[0];
}