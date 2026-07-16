'use server';

import { revalidatePath } from 'next/cache';
import {
  type AvailabilityWindowInput,
  replaceWeeklyAvailability,
} from '@/app/lib/repos/employee-availability';
import { requireRoleFromCookie } from '@/app/lib/utils/cookie';

export type EmployeeAvailabilityActionState = {
  error?: string;
  success?: string;
};

type SubmittedAvailabilityWindow = {
  dayOfWeek?: unknown;
  startTime?: unknown;
  endTime?: unknown;
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function convertTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

function validateAvailabilityWindows(
  value: unknown,
):
  | {
      success: true;
      windows: AvailabilityWindowInput[];
    }
  | {
      success: false;
      error: string;
    } {
  if (!Array.isArray(value)) {
    return {
      success: false,
      error: 'Availability must be submitted as a list of time windows.',
    };
  }

  const windows: AvailabilityWindowInput[] = [];

  for (const item of value as SubmittedAvailabilityWindow[]) {
    const dayOfWeek = item.dayOfWeek;
    const startTime = item.startTime;
    const endTime = item.endTime;

    if (
      !Number.isInteger(dayOfWeek) ||
      typeof dayOfWeek !== 'number' ||
      dayOfWeek < 0 ||
      dayOfWeek > 6
    ) {
      return {
        success: false,
        error: 'Each availability window must have a valid weekday.',
      };
    }

    if (
      typeof startTime !== 'string' ||
      typeof endTime !== 'string' ||
      !TIME_PATTERN.test(startTime) ||
      !TIME_PATTERN.test(endTime)
    ) {
      return {
        success: false,
        error: 'Each availability window must have valid start and end times.',
      };
    }

    if (
      convertTimeToMinutes(startTime) >= convertTimeToMinutes(endTime)
    ) {
      return {
        success: false,
        error: 'Each start time must be earlier than its end time.',
      };
    }

    windows.push({
      dayOfWeek,
      startTime,
      endTime,
    });
  }

  const windowsByDay = new Map<number, AvailabilityWindowInput[]>();

  for (const window of windows) {
    const dayWindows = windowsByDay.get(window.dayOfWeek) ?? [];

    dayWindows.push(window);
    windowsByDay.set(window.dayOfWeek, dayWindows);
  }

  for (const dayWindows of windowsByDay.values()) {
    dayWindows.sort(
      (first, second) =>
        convertTimeToMinutes(first.startTime) -
        convertTimeToMinutes(second.startTime),
    );

    for (let index = 1; index < dayWindows.length; index += 1) {
      const previousWindow = dayWindows[index - 1];
      const currentWindow = dayWindows[index];

      if (
        convertTimeToMinutes(currentWindow.startTime) <
        convertTimeToMinutes(previousWindow.endTime)
      ) {
        return {
          success: false,
          error:
            'Availability windows on the same day cannot overlap.',
        };
      }
    }
  }

  return {
    success: true,
    windows,
  };
}

export async function saveEmployeeAvailability(
  previousState: EmployeeAvailabilityActionState,
  formData: FormData,
): Promise<EmployeeAvailabilityActionState> {
  const employee = await requireRoleFromCookie('employee');
  const serializedAvailability = formData.get('availability');

  if (typeof serializedAvailability !== 'string') {
    return {
      error: 'Availability data was not submitted.',
    };
  }

  let parsedAvailability: unknown;

  try {
    parsedAvailability = JSON.parse(serializedAvailability);
  } catch {
    return {
      error: 'Availability data is not formatted correctly.',
    };
  }

  const validationResult =
    validateAvailabilityWindows(parsedAvailability);

  if (!validationResult.success) {
    return {
      error: validationResult.error,
    };
  }

  try {
    await replaceWeeklyAvailability(
      employee.id,
      validationResult.windows,
    );
  } catch (error) {
    console.error('Failed to save employee availability:', error);

    return {
      error: 'Unable to save your availability. Please try again.',
    };
  }

  revalidatePath('/dashboard/employee/set-preferred-availability');    // Change to employee set availability once that route exists

  return {
    success: 'Availability saved successfully.',
  };
}