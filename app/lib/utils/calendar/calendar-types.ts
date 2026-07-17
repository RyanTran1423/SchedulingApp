export type CalendarEventType = 'shift' | 'availability';

export type CalendarEvent = {
  id: string;
  type: CalendarEventType;
  dateKey: string;
  title: string;
  startTime: string;
  endTime: string;
  subtitle?: string;
  description?: string;
  status?: string;
};