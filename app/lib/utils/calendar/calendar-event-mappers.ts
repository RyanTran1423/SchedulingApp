import type {
  CalendarEvent,
} from '@/app/lib/utils/calendar/calendar-types';
import type {
  CalendarGridDay,
} from '@/app/lib/utils/calendar';
import {
  formatDatabaseDate,
  formatDatabaseTime,
} from '@/app/lib/utils/calendar';
import type {
  EmployeeAvailabilityRow,
} from '@/app/lib/repos/employee-availability';
import type {
  ShiftRow,
} from '@/app/lib/repos/shifts';

function formatStatusLabel(status: string) {
  return status
    .split('_')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function mapShiftsToCalendarEvents(
  shifts: ShiftRow[],
): CalendarEvent[] {
  return shifts.map((shift) => {
    const statusLabel = formatStatusLabel(shift.status);

    return {
      id: `shift-${shift.id}`,
      type: 'shift',
      dateKey: formatDatabaseDate(shift.shift_date),
      title: 'Scheduled Shift',
      startTime: formatDatabaseTime(String(shift.start_time)),
      endTime: formatDatabaseTime(String(shift.end_time)),
      subtitle: statusLabel,
      description: `Shift status: ${statusLabel}`,
      status: shift.status,
    };
  });
}

export function mapWeeklyAvailabilityToCalendarEvents({
  availability,
  weekDays,
}: {
  availability: EmployeeAvailabilityRow[];
  weekDays: CalendarGridDay[];
}): CalendarEvent[] {
  return availability.flatMap((availabilityWindow) => {
    const matchingDay = weekDays.find((day) => {
      return day.dayOfWeek === availabilityWindow.day_of_week;
    });

    if (!matchingDay) {
      return [];
    }

    return {
      id: `availability-${availabilityWindow.id}-${matchingDay.dateKey}`,
      type: 'availability',
      dateKey: matchingDay.dateKey,
      title: 'Available',
      startTime: formatDatabaseTime(String(availabilityWindow.start_time)),
      endTime: formatDatabaseTime(String(availabilityWindow.end_time)),
      subtitle: 'Preferred availability',
      description: 'This is one of your saved weekly availability windows.',
    };
  });
}