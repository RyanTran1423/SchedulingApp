// sql to handle queries for viewing employee information

import {sql} from '@/app/lib/db';

export type ViewEmployeeRow = {
    name: string;
    email: string;
    role: string;
    organization: string;
}

export async function getEmployees(
    organizationId: number
): Promise<ViewEmployeeRow[]> {
 // users.email goes in blank space
    const employees = await sql<ViewEmployeeRow[]>` 
        SELECT
            users.name,
            users.email,
            users.role,
            organizations.name AS organization
        FROM users
        JOIN organizations
            ON users.organization_id = organizations.id
        WHERE users.organization_id = ${organizationId}
        ORDER BY users.name;
    `;
    
    return employees;
}