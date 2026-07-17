import WeeklyTimeGridCalendar from '@/app/ui/calendar/weekly-time-grid-calendar';
import { requireEmployee } from '@/app/lib/utils/auth/require-employee';
import { findWeeklyAvailability } from '@/app/lib/repos/employee-availability';
import { findEmployeeShiftsInDateRange } from '@/app/lib/repos/shifts';
import {
  formatDateKey,
  getDateFromOptionalDateKey,
  getEndOfWeek,
  getStartOfWeek,
  getWeekDays,
} from '@/app/lib/utils/calendar';
import {
  mapShiftsToCalendarEvents,
  mapWeeklyAvailabilityToCalendarEvents,
} from '@/app/lib/utils/calendar/calendar-event-mappers';

type EmployeeSchedulePageProps = {
  searchParams?: Promise<{
    date?: string;
  }> | {
    date?: string;
  };
};

export default async function EmployeeSchedulePage({
  searchParams,
}: EmployeeSchedulePageProps) {
  const employee = await requireEmployee();
  const params = await searchParams;

  const selectedDate = getDateFromOptionalDateKey(params?.date);
  const startOfWeek = getStartOfWeek(selectedDate);
  const endOfWeek = getEndOfWeek(selectedDate);

  const startDateKey = formatDateKey(startOfWeek);
  const endDateKey = formatDateKey(endOfWeek);
  const weekDays = getWeekDays(selectedDate);

  const [savedAvailability, savedShifts] = await Promise.all([
    findWeeklyAvailability(employee.id),
    findEmployeeShiftsInDateRange({
      employeeId: employee.id,
      startDate: startDateKey,
      endDate: endDateKey,
    }),
  ]);

  const events = [
    ...mapWeeklyAvailabilityToCalendarEvents({
      availability: savedAvailability,
      weekDays,
    }),
    ...mapShiftsToCalendarEvents(savedShifts),
  ];

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">
          My Calendar
        </h1>

        <p className="mt-2 text-gray-600">
          View your saved shifts and weekly availability.
        </p>
      </div>

      <WeeklyTimeGridCalendar
        events={events}
        selectedDateKey={formatDateKey(selectedDate)}
        basePath="/dashboard/employee/schedule"
      />
    </section>
  );
}