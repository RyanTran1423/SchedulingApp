'use server';

import { revalidatePath } from 'next/cache';
import { requireEmployee } from '@/app/lib/utils/auth/require-employee';
import { upsertEmployeeSchedulingPreference } from '@/app/lib/repos/employee-scheduling-preferences';

export type PreferredWeeklyHoursActionState = {
  error?: string;
  success?: string;
};

const HOURS_PATTERN = /^\d{1,2}(\.\d)?$/;

function parsePreferredWeeklyHours(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return {
      success: false as const,
      error: 'Preferred weekly hours are required.',
    };
  }

  const trimmedValue = value.trim();

  if (!HOURS_PATTERN.test(trimmedValue)) {
    return {
      success: false as const,
      error: 'Enter hours as a number with up to one decimal place.',
    };
  }

  const hours = Number(trimmedValue);

  if (Number.isNaN(hours) || hours < 0 || hours > 80) {
    return {
      success: false as const,
      error: 'Preferred weekly hours must be between 0 and 80.',
    };
  }

  return {
    success: true as const,
    hours,
  };
}

export async function savePreferredWeeklyHours(
  _previousState: PreferredWeeklyHoursActionState,
  formData: FormData,
): Promise<PreferredWeeklyHoursActionState> {
  const employee = await requireEmployee();

  const validationResult = parsePreferredWeeklyHours(
    formData.get('preferredWeeklyHours'),
  );

  if (!validationResult.success) {
    return {
      error: validationResult.error,
    };
  }

  try {
    await upsertEmployeeSchedulingPreference({
      userId: employee.id,
      preferredWeeklyHours: validationResult.hours,
    });
  } catch (error) {
    console.error('Failed to save preferred weekly hours:', error);

    return {
      error: 'Unable to save preferred weekly hours. Please try again.',
    };
  }

  revalidatePath('/dashboard/employee');

  return {
    success: 'Preferred weekly hours saved.',
  };
}