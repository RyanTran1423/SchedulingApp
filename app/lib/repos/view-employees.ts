// sql to handle queries for viewing employee information

import {sql} from '@/app/lib/db';

export type ViewEmployeeRow = {
    name: string;
    email: string;
    role: string;
    organization: string;
}

export async function getEmployees(
    organizationId: string
): Promise<ViewEmployeeRow[]> {

    const employees = await sql<ViewEmployeeRow[]>`
        SELECT
            users.name,
            users.email,
            organization_roles.name AS role,
            organization.name AS organization
        FROM users
        JOIN organization
            ON users.organization_id = organization.id
        LEFT JOIN user_organization_roles
            ON users.id = user_organization_roles.user_id
        LEFT JOIN organization_roles
            ON user_organization_roles.organization_role_id = organization_roles.id
        WHERE users.organization_id = ${organizationId}
        ORDER BY users.name;
    `;

    return employees;
}