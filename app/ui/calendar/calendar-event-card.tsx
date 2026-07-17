import type { CSSProperties } from 'react';
import type {
  CalendarEvent,
} from '@/app/lib/utils/calendar/calendar-types';

type CalendarEventCardProps = {
  event: CalendarEvent;
  style: CSSProperties;
  onClick: (event: CalendarEvent) => void;
};

function getEventStyles(type: CalendarEvent['type']) {
  if (type === 'shift') {
    return 'border-l-blue-500 bg-blue-100 text-blue-950 hover:bg-blue-200';
  }

  return 'border-l-green-500 bg-green-100 text-green-950 hover:bg-green-200';
}

function getEventLabel(type: CalendarEvent['type']) {
  if (type === 'shift') {
    return 'Shift';
  }

  return 'Availability';
}

export default function CalendarEventCard({
  event,
  style,
  onClick,
}: CalendarEventCardProps) {
  return (
    <button
      type="button"
      style={style}
      onClick={() => onClick(event)}
      className={`absolute left-1 right-1 overflow-hidden rounded-md border border-l-4 px-2 py-1 text-left text-xs shadow-sm transition ${getEventStyles(
        event.type,
      )}`}
    >
      <p className="font-semibold">
        {event.startTime} - {event.endTime}
      </p>

      <p className="truncate font-medium">
        {event.title}
      </p>

      <p className="truncate text-[11px] opacity-80">
        {getEventLabel(event.type)}
      </p>
    </button>
  );
}