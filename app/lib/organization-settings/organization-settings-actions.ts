'use server';

import { revalidatePath } from 'next/cache';
import { findOrganizationRoles } from '@/app/lib/repos/org-roles';
import {
  replaceOrganizationSettings,
  type RoleRequirementInput,
  type WorkingHoursInput,
} from '@/app/lib/repos/organization-settings';
import { requireManager } from '@/app/lib/utils/auth/require-manager';

export type OrganizationSettingsActionState = {
  error?: string;
  success?: string;
};

type SubmittedWorkingHours = {
  dayOfWeek?: unknown;
  isClosed?: unknown;
  startTime?: unknown;
  endTime?: unknown;
};

type SubmittedRoleRequirement = {
  organizationRoleId?: unknown;
  dayOfWeek?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  requiredCount?: unknown;
};

type SubmittedOrganizationSettings = {
  workingHours?: unknown;
  roleRequirements?: unknown;
};

type ValidatedOrganizationSettings = {
  workingHours: WorkingHoursInput[];
  roleRequirements: RoleRequirementInput[];
};

type ValidationResult =
  | {
      success: true;
      settings: ValidatedOrganizationSettings;
    }
  | {
      success: false;
      error: string;
    };

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidDayOfWeek(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 6
  );
}

function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_PATTERN.test(value);
}

function convertTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

function validateOrganizationSettings(
  value: unknown,
  validRoleIds: Set<number>,
): ValidationResult {
  if (!isRecord(value)) {
    return {
      success: false,
      error: 'Organization settings are not formatted correctly.',
    };
  }

  const submittedSettings = value as SubmittedOrganizationSettings;

  if (!Array.isArray(submittedSettings.workingHours)) {
    return {
      success: false,
      error: 'Working hours must be submitted as a list.',
    };
  }

  if (!Array.isArray(submittedSettings.roleRequirements)) {
    return {
      success: false,
      error: 'Staffing requirements must be submitted as a list.',
    };
  }

  /*
   * Validate working hours
   */

  const workingHours: WorkingHoursInput[] = [];
  const submittedDays = new Set<number>();

  for (const submittedHours of submittedSettings.workingHours) {
    if (!isRecord(submittedHours)) {
      return {
        success: false,
        error: 'Each working-hours entry must be formatted correctly.',
      };
    }

    const hours = submittedHours as SubmittedWorkingHours;
    const dayOfWeek = hours.dayOfWeek;
    const isClosed = hours.isClosed;

    if (!isValidDayOfWeek(dayOfWeek)) {
      return {
        success: false,
        error: 'Each working-hours entry must have a valid weekday.',
      };
    }

    if (submittedDays.has(dayOfWeek)) {
      return {
        success: false,
        error: 'Each weekday may only appear once in working hours.',
      };
    }

    submittedDays.add(dayOfWeek);

    if (typeof isClosed !== 'boolean') {
      return {
        success: false,
        error: 'Each weekday must be marked as open or closed.',
      };
    }

    if (isClosed) {
      workingHours.push({
        dayOfWeek,
        isClosed: true,
        startTime: null,
        endTime: null,
      });

      continue;
    }

    const startTime = hours.startTime;
    const endTime = hours.endTime;

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return {
        success: false,
        error: 'Every open day must have valid opening and closing times.',
      };
    }

    if (
      convertTimeToMinutes(startTime) >= convertTimeToMinutes(endTime)
    ) {
      return {
        success: false,
        error: 'Opening time must be earlier than closing time.',
      };
    }

    workingHours.push({
      dayOfWeek,
      isClosed: false,
      startTime,
      endTime,
    });
  }

  if (workingHours.length !== 7 || submittedDays.size !== 7) {
    return {
      success: false,
      error: 'Working hours must include all seven days of the week.',
    };
  }

  const workingHoursByDay = new Map<number, WorkingHoursInput>();

  for (const hours of workingHours) {
    workingHoursByDay.set(hours.dayOfWeek, hours);
  }

  /*
   * Validate role requirements
   */

  const roleRequirements: RoleRequirementInput[] = [];
  const exactRequirementKeys = new Set<string>();

  for (const submittedRequirement of submittedSettings.roleRequirements) {
    if (!isRecord(submittedRequirement)) {
      return {
        success: false,
        error: 'Each staffing requirement must be formatted correctly.',
      };
    }

    const requirement =
      submittedRequirement as SubmittedRoleRequirement;

    const organizationRoleId = requirement.organizationRoleId;
    const dayOfWeek = requirement.dayOfWeek;
    const startTime = requirement.startTime;
    const endTime = requirement.endTime;
    const requiredCount = requirement.requiredCount;

    if (
      typeof organizationRoleId !== 'number' ||
      !Number.isInteger(organizationRoleId) ||
      organizationRoleId <= 0
    ) {
      return {
        success: false,
        error: 'Each staffing requirement must use a valid role.',
      };
    }

    if (!validRoleIds.has(organizationRoleId)) {
      return {
        success: false,
        error:
          'One or more selected roles do not belong to your organization.',
      };
    }

    if (!isValidDayOfWeek(dayOfWeek)) {
      return {
        success: false,
        error: 'Each staffing requirement must have a valid weekday.',
      };
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return {
        success: false,
        error:
          'Each staffing requirement must have valid start and end times.',
      };
    }

    const startMinutes = convertTimeToMinutes(startTime);
    const endMinutes = convertTimeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      return {
        success: false,
        error:
          'Each staffing requirement start time must be earlier than its end time.',
      };
    }

    if (
      typeof requiredCount !== 'number' ||
      !Number.isInteger(requiredCount) ||
      requiredCount <= 0
    ) {
      return {
        success: false,
        error:
          'The number of employees needed must be a positive whole number.',
      };
    }

    const dayHours = workingHoursByDay.get(dayOfWeek);

    if (!dayHours) {
      return {
        success: false,
        error:
          'A staffing requirement references a day without working hours.',
      };
    }

    if (dayHours.isClosed) {
      return {
        success: false,
        error:
          'Staffing requirements cannot be added to a closed day.',
      };
    }

    if (!dayHours.startTime || !dayHours.endTime) {
      return {
        success: false,
        error: 'The organization working hours are incomplete.',
      };
    }

    const openingMinutes = convertTimeToMinutes(dayHours.startTime);
    const closingMinutes = convertTimeToMinutes(dayHours.endTime);

    if (
      startMinutes < openingMinutes ||
      endMinutes > closingMinutes
    ) {
      return {
        success: false,
        error:
          'Staffing requirements must fall within the organization working hours.',
      };
    }

    const exactRequirementKey = [
      organizationRoleId,
      dayOfWeek,
      startTime,
      endTime,
    ].join('-');

    if (exactRequirementKeys.has(exactRequirementKey)) {
      return {
        success: false,
        error:
          'The same role and time window cannot be entered more than once.',
      };
    }

    exactRequirementKeys.add(exactRequirementKey);

    roleRequirements.push({
      organizationRoleId,
      dayOfWeek,
      startTime,
      endTime,
      requiredCount,
    });
  }

  /*
   * Prevent overlapping windows for the same role on the same day.
   */

  const requirementsByRoleAndDay = new Map<
    string,
    RoleRequirementInput[]
  >();

  for (const requirement of roleRequirements) {
    const groupingKey = [
      requirement.organizationRoleId,
      requirement.dayOfWeek,
    ].join('-');

    const groupedRequirements =
      requirementsByRoleAndDay.get(groupingKey) ?? [];

    groupedRequirements.push(requirement);
    requirementsByRoleAndDay.set(groupingKey, groupedRequirements);
  }

  for (const groupedRequirements of requirementsByRoleAndDay.values()) {
    groupedRequirements.sort(
      (first, second) =>
        convertTimeToMinutes(first.startTime) -
        convertTimeToMinutes(second.startTime),
    );

    for (
      let index = 1;
      index < groupedRequirements.length;
      index += 1
    ) {
      const previousRequirement = groupedRequirements[index - 1];
      const currentRequirement = groupedRequirements[index];

      if (
        convertTimeToMinutes(currentRequirement.startTime) <
        convertTimeToMinutes(previousRequirement.endTime)
      ) {
        return {
          success: false,
          error:
            'Staffing windows for the same role and day cannot overlap.',
        };
      }
    }
  }

  workingHours.sort(
    (first, second) => first.dayOfWeek - second.dayOfWeek,
  );

  roleRequirements.sort((first, second) => {
    if (first.dayOfWeek !== second.dayOfWeek) {
      return first.dayOfWeek - second.dayOfWeek;
    }

    return (
      convertTimeToMinutes(first.startTime) -
      convertTimeToMinutes(second.startTime)
    );
  });

  return {
    success: true,
    settings: {
      workingHours,
      roleRequirements,
    },
  };
}

export async function saveOrganizationSettings(
  _previousState: OrganizationSettingsActionState,
  formData: FormData,
): Promise<OrganizationSettingsActionState> {
  const manager = await requireManager();
  const serializedSettings = formData.get('settings');

  if (typeof serializedSettings !== 'string') {
    return {
      error: 'Organization settings were not submitted.',
    };
  }

  let parsedSettings: unknown;

  try {
    parsedSettings = JSON.parse(serializedSettings);
  } catch {
    return {
      error: 'Organization settings are not formatted correctly.',
    };
  }

  try {
    const organizationRoles = await findOrganizationRoles(
      manager.organization_id,
    );

    const validRoleIds = new Set(
      organizationRoles.map((role) => role.id),
    );

    const validationResult = validateOrganizationSettings(
      parsedSettings,
      validRoleIds,
    );

    if (!validationResult.success) {
      return {
        error: validationResult.error,
      };
    }

    await replaceOrganizationSettings(
      manager.organization_id,
      validationResult.settings.workingHours,
      validationResult.settings.roleRequirements,
    );
  } catch (error) {
    console.error('Failed to save organization settings:', error);

    return {
      error:
        'Unable to save the organization settings. Please try again.',
    };
  }

  revalidatePath('/dashboard/manager/set-org-settings');

  return {
    success: 'Organization settings saved successfully.',
  };
}