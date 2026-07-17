'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  DAYS_OF_WEEK,
  formatDateKey,
  formatHourLabel,
  getHourSlots,
  getNextWeek,
  getPreviousWeek,
  getTimeGridPosition,
  getWeekCalendarTitle,
  getWeekDays,
  parseDateKey,
  timeToMinutes,
} from '@/app/lib/utils/calendar';
import type {
  CalendarEvent,
  CalendarEventType,
} from '@/app/lib/utils/calendar/calendar-types';
import CalendarEventCard from '@/app/ui/calendar/calendar-event-card';

type WeeklyTimeGridCalendarProps = {
  events: CalendarEvent[];
  selectedDateKey: string;
  basePath: string;
  startHour?: number;
  endHour?: number;
};

const HOUR_HEIGHT = 72;

const FILTERS: {
  label: string;
  value: CalendarEventType;
}[] = [
  { label: 'Shifts', value: 'shift' },
  { label: 'Availability', value: 'availability' },
];

export default function WeeklyTimeGridCalendar({
  events,
  selectedDateKey,
  basePath,
  startHour = 7,
  endHour = 21,
}: WeeklyTimeGridCalendarProps) {
  const selectedDate = useMemo(() => {
    return parseDateKey(selectedDateKey);
  }, [selectedDateKey]);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [visibleTypes, setVisibleTypes] = useState<CalendarEventType[]>([
    'shift',
    'availability',
  ]);

  const weekDays = useMemo(() => {
    return getWeekDays(selectedDate);
  }, [selectedDate]);

  const previousWeekDateKey = formatDateKey(getPreviousWeek(selectedDate));
  const nextWeekDateKey = formatDateKey(getNextWeek(selectedDate));

  const hourSlots = getHourSlots(startHour, endHour);
  const calendarHeight = (endHour - startHour) * HOUR_HEIGHT;

  const visibleEvents = events.filter((event) => {
    return visibleTypes.includes(event.type);
  });

  function toggleFilter(type: CalendarEventType) {
    setVisibleTypes((currentTypes) => {
      if (currentTypes.includes(type)) {
        return currentTypes.filter((currentType) => currentType !== type);
      }

      return [...currentTypes, type];
    });
  }

  function getEventsForDay(dateKey: string) {
    return visibleEvents.filter((event) => {
      const eventStart = timeToMinutes(event.startTime);
      const eventEnd = timeToMinutes(event.endTime);

      return (
        event.dateKey === dateKey &&
        eventEnd > startHour * 60 &&
        eventStart < endHour * 60
      );
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-black">
          Calendar Tools
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Toggle what appears on your weekly calendar.
        </p>

        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Show
          </p>

          <div className="flex flex-col gap-2">
            {FILTERS.map((filter) => {
              const isActive = visibleTypes.includes(filter.value);

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => toggleFilter(filter.value)}
                  className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
                    isActive
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Selected Item
          </p>

          {selectedEvent ? (
            <div className="mt-3">
              <p className="font-semibold text-black">
                {selectedEvent.title}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {selectedEvent.startTime} - {selectedEvent.endTime}
              </p>

              {selectedEvent.subtitle && (
                <p className="mt-1 text-sm text-gray-600">
                  {selectedEvent.subtitle}
                </p>
              )}

              {selectedEvent.description && (
                <p className="mt-3 text-sm text-gray-500">
                  {selectedEvent.description}
                </p>
              )}

              {selectedEvent.type === 'shift' && (
                <p className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  This shift came from the shifts database table.
                </p>
              )}

              {selectedEvent.type === 'availability' && (
                <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                  This availability came from your saved weekly availability.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              Click a shift or availability block to view details.
            </p>
          )}
        </div>
      </aside>

      <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              {getWeekCalendarTitle(selectedDate)}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Weekly view for saved shifts and availability.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`${basePath}?date=${previousWeekDateKey}`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-black hover:bg-gray-100"
            >
              Previous
            </Link>

            <Link
              href={basePath}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-black hover:bg-gray-100"
            >
              Today
            </Link>

            <Link
              href={`${basePath}?date=${nextWeekDateKey}`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-black hover:bg-gray-100"
            >
              Next
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <div
              className="grid border-b border-gray-200"
              style={{
                gridTemplateColumns: '72px repeat(7, minmax(130px, 1fr))',
              }}
            >
              <div />

              {weekDays.map((day) => (
                <div
                  key={day.dateKey}
                  className="border-l border-gray-200 px-3 py-3 text-center"
                >
                  <p
                    className={`text-xs font-semibold ${
                      day.dayOfWeek === 0
                        ? 'text-red-500'
                        : day.isToday
                          ? 'text-purple-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {DAYS_OF_WEEK[day.dayOfWeek].slice(0, 3)}{' '}
                    {day.dayNumber}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: '72px repeat(7, minmax(130px, 1fr))',
              }}
            >
              <div
                className="relative border-r border-gray-200"
                style={{ height: calendarHeight }}
              >
                {hourSlots.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-2 -translate-y-2 text-right text-xs font-medium text-gray-500"
                    style={{
                      top: (hour - startHour) * HOUR_HEIGHT,
                    }}
                  >
                    {formatHourLabel(hour)}
                  </div>
                ))}
              </div>

              {weekDays.map((day) => {
                const dayEvents = getEventsForDay(day.dateKey);

                return (
                  <div
                    key={day.dateKey}
                    className="relative border-r border-gray-200"
                    style={{ height: calendarHeight }}
                  >
                    {hourSlots.map((hour) => (
                      <div
                        key={hour}
                        className="absolute left-0 right-0 border-t border-gray-200"
                        style={{
                          top: (hour - startHour) * HOUR_HEIGHT,
                        }}
                      />
                    ))}

                    {dayEvents.map((event) => {
                      const position = getTimeGridPosition({
                        startTime: event.startTime,
                        endTime: event.endTime,
                        startHour,
                        hourHeight: HOUR_HEIGHT,
                      });

                      return (
                        <CalendarEventCard
                          key={event.id}
                          event={event}
                          onClick={setSelectedEvent}
                          style={{
                            top: Math.max(position.top, 0),
                            height: Math.max(position.height, 42),
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}