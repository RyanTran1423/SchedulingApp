import WeeklyTimeGridCalendar from '@/app/ui/calendar/weekly-time-grid-calendar';
import { requireEmployee } from '@/app/lib/utils/auth/require-employee';
import { findWeeklyAvailability } from '@/app/lib/repos/employee-availability';
import { findEmployeeShiftsInDateRange } from '@/app/lib/repos/shifts';
import { findOrganizationWeeklyHours } from '@/app/lib/repos/organization-settings';
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
  searchParams?:
    | Promise<{
        date?: string;
      }>
    | {
        date?: string;
      };
};

type BusinessHours = {
  dateKey: string;
  startTime: string;
  endTime: string;
};

function timeToMinutes(time: string) {
  const [hour, minute] = time
    .slice(0, 5)
    .split(':')
    .map(Number);

  return hour * 60 + minute;
}

function getCalendarHourRange(businessHours: BusinessHours[]) {
  if (businessHours.length === 0) {
    return {
      startHour: 7,
      endHour: 21,
    };
  }

  const openingMinutes = businessHours.map((hours) => {
    return timeToMinutes(hours.startTime);
  });

  const closingMinutes = businessHours.map((hours) => {
    return timeToMinutes(hours.endTime);
  });

  const earliestOpening = Math.min(...openingMinutes);
  const latestClosing = Math.max(...closingMinutes);

  const startHour = Math.max(0, Math.floor(earliestOpening / 60) - 1);
  const endHour = Math.min(24, Math.ceil(latestClosing / 60) + 1);

  if (endHour <= startHour) {
    return {
      startHour: 7,
      endHour: 21,
    };
  }

  return {
    startHour,
    endHour,
  };
}

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

  const [savedAvailability, savedShifts, organizationHours] =
    await Promise.all([
      findWeeklyAvailability(employee.id),
      findEmployeeShiftsInDateRange({
        employeeId: employee.id,
        startDate: startDateKey,
        endDate: endDateKey,
      }),
      findOrganizationWeeklyHours(employee.organization_id),
    ]);

  const events = [
    ...mapWeeklyAvailabilityToCalendarEvents({
      availability: savedAvailability,
      weekDays,
    }),
    ...mapShiftsToCalendarEvents(savedShifts),
  ];

  const businessHours = weekDays.flatMap((day) => {
    const matchingHours = organizationHours.find((hours) => {
      return Number(hours.day_of_week) === day.dayOfWeek;
    });

    if (
      !matchingHours ||
      matchingHours.is_closed ||
      !matchingHours.start_time ||
      !matchingHours.end_time
    ) {
      return [];
    }

    return {
      dateKey: day.dateKey,
      startTime: String(matchingHours.start_time).slice(0, 5),
      endTime: String(matchingHours.end_time).slice(0, 5),
    };
  });

  const { startHour, endHour } = getCalendarHourRange(businessHours);

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
        businessHours={businessHours}
        startHour={startHour}
        endHour={endHour}
      />
    </section>
  );
}