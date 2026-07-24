import { sql } from '@/app/lib/db';

// New SQL query to assign employee to role with validation checks
export type AssignEmployeeToRoleResult =
  | {
      success: true;
      status: 'assigned';
    }
  | {
      success: false;
      status: 'already-assigned' | 'invalid-selection';
    };

/**
 * Assigns an employee to an organization role.
 *
 * The query verifies that:
 * - The user exists.
 * - The user is an employee.
 * - The employee belongs to the manager's organization.
 * - The organization role belongs to the manager's organization.
 * - The assignment does not already exist.
 */
export async function assignEmployeeToRole(
  organizationId: number,
  userId: number,
  organizationRoleId: number,
): Promise<AssignEmployeeToRoleResult> {
  const result = await sql<
    {
      is_valid: boolean;
      was_inserted: boolean;
    }[]
  >`
    WITH valid_assignment AS (
      SELECT
        employee.id AS user_id,
        organization_role.id AS organization_role_id
      FROM users employee
      JOIN organization_roles organization_role
        ON organization_role.id = ${organizationRoleId}
      WHERE employee.id = ${userId}
        AND employee.role = 'employee'
        AND employee.organization_id = ${organizationId}
        AND organization_role.organization_id = ${organizationId}
    ),
    inserted_assignment AS (
      INSERT INTO user_organization_roles (
        user_id,
        organization_role_id
      )
      SELECT
        user_id,
        organization_role_id
      FROM valid_assignment
      ON CONFLICT (
        user_id,
        organization_role_id
      )
      DO NOTHING
      RETURNING user_id
    )
    SELECT
      EXISTS (
        SELECT 1
        FROM valid_assignment
      ) AS is_valid,
      EXISTS (
        SELECT 1
        FROM inserted_assignment
      ) AS was_inserted;
  `;

  const assignmentResult = result[0];

  if (!assignmentResult?.is_valid) {
    return {
      success: false,
      status: 'invalid-selection',
    };
  }

  if (!assignmentResult.was_inserted) {
    return {
      success: false,
      status: 'already-assigned',
    };
  }

  return {
    success: true,
    status: 'assigned',
  };
}