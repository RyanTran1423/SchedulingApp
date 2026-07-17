export type CalendarGridDay = {
  date: Date;
  dateKey: string;
  dayNumber: number;
  dayOfWeek: number;
  isToday: boolean;
};

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function isValidDateKey(dateKey: string | undefined) {
  if (!dateKey) {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return false;
  }

  const parsedDate = parseDateKey(dateKey);

  return !Number.isNaN(parsedDate.getTime());
}

export function getDateFromOptionalDateKey(dateKey: string | undefined) {
  if (!isValidDateKey(dateKey)) {
    return new Date();
  }

  return parseDateKey(dateKey as string);
}

export function isSameDay(firstDate: Date, secondDate: Date) {
  return formatDateKey(firstDate) === formatDateKey(secondDate);
}

export function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + amount);

  return nextDate;
}

export function getStartOfWeek(date: Date) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
}

export function getEndOfWeek(date: Date) {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = addDays(startOfWeek, 6);

  endOfWeek.setHours(23, 59, 59, 999);

  return endOfWeek;
}

export function getWeekDays(date: Date): CalendarGridDay[] {
  const today = new Date();
  const startOfWeek = getStartOfWeek(date);

  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(startOfWeek, index);

    return {
      date: day,
      dateKey: formatDateKey(day),
      dayNumber: day.getDate(),
      dayOfWeek: day.getDay(),
      isToday: isSameDay(day, today),
    };
  });
}

export function getPreviousWeek(date: Date) {
  return addDays(date, -7);
}

export function getNextWeek(date: Date) {
  return addDays(date, 7);
}

export function getWeekOfMonth(date: Date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const adjustedDate = date.getDate() + firstDayOfMonth.getDay();

  return Math.ceil(adjustedDate / 7);
}

export function getWeekCalendarTitle(date: Date) {
  const startOfWeek = getStartOfWeek(date);
  const monthName = startOfWeek.toLocaleDateString('en-US', {
    month: 'long',
  });

  return `${monthName} - Week ${getWeekOfMonth(startOfWeek)}`;
}

export function getHourSlots(startHour: number, endHour: number) {
  return Array.from(
    { length: endHour - startHour },
    (_, index) => startHour + index,
  );
}

export function formatHourLabel(hour: number) {
  if (hour === 12) {
    return 'Noon';
  }

  if (hour === 0) {
    return '12 AM';
  }

  if (hour < 12) {
    return `${hour} AM`;
  }

  return `${hour - 12} PM`;
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

export function formatDatabaseTime(time: string) {
  return String(time).slice(0, 5);
}

export function formatDatabaseDate(date: string | Date) {
  if (date instanceof Date) {
    return formatDateKey(date);
  }

  return String(date).slice(0, 10);
}

export function getTimeGridPosition({
  startTime,
  endTime,
  startHour,
  hourHeight,
}: {
  startTime: string;
  endTime: string;
  startHour: number;
  hourHeight: number;
}) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const gridStartMinutes = startHour * 60;

  const top = ((startMinutes - gridStartMinutes) / 60) * hourHeight;
  const height = ((endMinutes - startMinutes) / 60) * hourHeight;

  return {
    top,
    height,
  };
}