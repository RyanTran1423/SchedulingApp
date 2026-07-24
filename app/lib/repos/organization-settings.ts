import { sql } from '@/app/lib/db';

export type OrganizationWeeklyHoursRow = {
  id: number;
  organization_id: number;
  day_of_week: number;
  is_closed: boolean;
  start_time: string | null;
  end_time: string | null;
  created_at: Date;
  updated_at: Date;
};

export type OrganizationRoleRequirementRow = {
  id: number;
  organization_id: number;
  organization_role_id: number;
  role_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  required_count: number;
  created_at: Date;
  updated_at: Date;
};

export type WorkingHoursInput = {
  dayOfWeek: number;
  isClosed: boolean;
  startTime: string | null;
  endTime: string | null;
};

export type RoleRequirementInput = {
  organizationRoleId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  requiredCount: number;
};

export async function findOrganizationWeeklyHours(
  organizationId: number,
): Promise<OrganizationWeeklyHoursRow[]> {
  const result =
    await sql<OrganizationWeeklyHoursRow[]>`
      SELECT
        id,
        organization_id,
        day_of_week,
        is_closed,
        start_time,
        end_time,
        created_at,
        updated_at
      FROM organization_weekly_hours
      WHERE organization_id = ${organizationId}
      ORDER BY day_of_week ASC;
    `;

  return result;
}

export async function findOrganizationRoleRequirements(
  organizationId: number,
): Promise<OrganizationRoleRequirementRow[]> {
  const result =
    await sql<OrganizationRoleRequirementRow[]>`
      SELECT
        requirement.id,
        requirement.organization_id,
        requirement.organization_role_id,
        role.name AS role_name,
        requirement.day_of_week,
        requirement.start_time,
        requirement.end_time,
        requirement.required_count,
        requirement.created_at,
        requirement.updated_at
      FROM organization_role_requirements requirement
      JOIN organization_roles role
        ON role.id = requirement.organization_role_id
        AND role.organization_id =
          requirement.organization_id
      WHERE requirement.organization_id =
        ${organizationId}
        AND role.organization_id = ${organizationId}
      ORDER BY
        requirement.day_of_week ASC,
        requirement.start_time ASC,
        role.name ASC;
    `;

  return result;
}

export async function replaceOrganizationSettings(
  organizationId: number,
  workingHours: WorkingHoursInput[],
  roleRequirements: RoleRequirementInput[],
): Promise<void> {
  await sql.begin(async (transaction) => {
    await transaction`
      DELETE FROM organization_role_requirements
      WHERE organization_id = ${organizationId};
    `;

    await transaction`
      DELETE FROM organization_weekly_hours
      WHERE organization_id = ${organizationId};
    `;

    for (const hours of workingHours) {
      await transaction`
        INSERT INTO organization_weekly_hours (
          organization_id,
          day_of_week,
          is_closed,
          start_time,
          end_time
        )
        VALUES (
          ${organizationId},
          ${hours.dayOfWeek},
          ${hours.isClosed},
          ${hours.startTime},
          ${hours.endTime}
        );
      `;
    }

    for (const requirement of roleRequirements) {
      const insertedRows =
        await transaction<{ id: number }[]>`
          INSERT INTO organization_role_requirements (
            organization_id,
            organization_role_id,
            day_of_week,
            start_time,
            end_time,
            required_count
          )
          SELECT
            ${organizationId},
            role.id,
            ${requirement.dayOfWeek},
            ${requirement.startTime},
            ${requirement.endTime},
            ${requirement.requiredCount}
          FROM organization_roles role
          WHERE role.id =
            ${requirement.organizationRoleId}
            AND role.organization_id =
              ${organizationId}
          RETURNING id;
        `;

      if (!insertedRows[0]) {
        throw new Error(
          'The selected role was not found or does not belong to this organization.',
        );
      }
    }
  });
}