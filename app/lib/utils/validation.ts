export type UserRole = 'manager' | 'employee';

export function isValidEmail(email: string | null | undefined): email is string {
  if (!email) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(
  password: string | null | undefined
): password is string {
  if (!password) {
    return false;
  }

  return password.length >= 8;
}

export function isValidUserRole(
  role: string | null | undefined
): role is UserRole {
  return role === 'manager' || role === 'employee';
}

export function isValidOrganizationRoleName(
  name: string | null | undefined
): name is string {
  if (!name) {
    return false;
  }

  return name.trim().length > 0;
}