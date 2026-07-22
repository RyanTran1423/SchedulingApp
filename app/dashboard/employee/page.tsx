import { requireEmployee } from '@/app/lib/utils/auth/require-employee';
import { findEmployeeSchedulingPreference } from '@/app/lib/repos/employee-scheduling-preferences';
import PreferredWeeklyHoursForm from '@/app/ui/scheduling-preferences/preferred-weekly-hours-form';

function formatPreferredWeeklyHours(value: string | undefined) {
  if (!value) {
    return '';
  }

  return Number(value).toFixed(1);
}

export default async function EmployeeDashboardPage() {
  const employee = await requireEmployee();

  const preference = await findEmployeeSchedulingPreference(employee.id);

  return (
    <section>
      <div className="mb-8 flex justify-start">
        <PreferredWeeklyHoursForm
          initialPreferredWeeklyHours={formatPreferredWeeklyHours(
            preference?.preferred_weekly_hours,
          )}
        />
      </div>

      <h1 className="text-3xl font-bold text-black">
        Employee Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Welcome back.
      </p>
    </section>
  );
}