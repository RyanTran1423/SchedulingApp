import OrganizationSettingsForm from '@/app/ui/organization-settings/organization-settings-form';
import { requireManager } from '@/app/lib/utils/auth/require-manager';
import { findOrganizationRoles } from '@/app/lib/repos/org-roles';
import {
  findOrganizationRoleRequirements,
  findOrganizationWeeklyHours,
} from '@/app/lib/repos/organization-settings';

function formatTimeForInput(
  time: string | null,
): string {
  return time ? String(time).slice(0, 5) : '';
}

export default async function SetOrgSettingsPage() {
  const manager = await requireManager();

  const [roles, savedHours, savedRequirements] =
    await Promise.all([
      findOrganizationRoles(manager.organization_id),
      findOrganizationWeeklyHours(
        manager.organization_id,
      ),
      findOrganizationRoleRequirements(
        manager.organization_id,
      ),
    ]);

  const normalizedRoles = roles.map((role) => ({
    id: Number(role.id),
    name: role.name,
    description: role.description,
  }));

  const initialWorkingHours = savedHours.map(
    (hours) => ({
      id: Number(hours.id),
      dayOfWeek: Number(hours.day_of_week),
      isClosed: hours.is_closed === true,
      startTime: formatTimeForInput(hours.start_time),
      endTime: formatTimeForInput(hours.end_time),
    }),
  );

  const initialRoleRequirements =
    savedRequirements.map((requirement) => ({
      id: Number(requirement.id),
      organizationRoleId: Number(
        requirement.organization_role_id,
      ),
      dayOfWeek: Number(requirement.day_of_week),
      startTime: formatTimeForInput(
        requirement.start_time,
      ),
      endTime: formatTimeForInput(
        requirement.end_time,
      ),
      requiredCount: Number(
        requirement.required_count,
      ),
    }));

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">
          Set Organization Settings
        </h1>

        <p className="mt-2 text-gray-600">
          Configure your weekly working hours and staffing
          requirements.
        </p>
      </div>

      <OrganizationSettingsForm
        roles={normalizedRoles}
        initialWorkingHours={initialWorkingHours}
        initialRoleRequirements={
          initialRoleRequirements
        }
      />
    </section>
  );
}