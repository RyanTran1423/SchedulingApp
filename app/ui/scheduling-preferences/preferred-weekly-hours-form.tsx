'use client';

import { useActionState } from 'react';
import {
  savePreferredWeeklyHours,
  type PreferredWeeklyHoursActionState,
} from '@/app/lib/scheduling-preferences/employee-scheduling-preference-actions';

type PreferredWeeklyHoursFormProps = {
  initialPreferredWeeklyHours: string;
};

const initialActionState: PreferredWeeklyHoursActionState = {
  error: '',
  success: '',
};

export default function PreferredWeeklyHoursForm({
  initialPreferredWeeklyHours,
}: PreferredWeeklyHoursFormProps) {
  const [state, formAction, isPending] = useActionState(
    savePreferredWeeklyHours,
    initialActionState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm"
    >
      <label
        htmlFor="preferred-weekly-hours"
        className="text-sm font-semibold text-black"
      >
        Preferred Weekly Hours:
      </label>

      <input
        id="preferred-weekly-hours"
        name="preferredWeeklyHours"
        type="number"
        min="0"
        max="80"
        step="0.1"
        defaultValue={initialPreferredWeeklyHours}
        placeholder="14.5"
        className="h-9 w-24 rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none focus:border-purple-500"
      />

      <button
        type="submit"
        disabled={isPending}
        className="h-9 rounded-md bg-purple-500 px-3 text-sm font-medium text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-purple-300"
      >
        {isPending ? 'Saving...' : 'Save'}
      </button>

      {state?.error && (
        <p className="text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}

      {state?.success && (
        <p className="text-sm font-medium text-green-600">
          {state.success}
        </p>
      )}
    </form>
  );
}