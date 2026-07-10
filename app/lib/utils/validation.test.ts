import { describe, expect, it } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isValidUserRole,
  isValidOrganizationRoleName,
} from './validation';

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('returns true for a valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('returns false for an invalid email', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
    });

    it('returns false for an empty email', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('returns true for passwords with at least 8 characters', () => {
      expect(isValidPassword('password')).toBe(true);
    });

    it('returns false for passwords shorter than 8 characters', () => {
      expect(isValidPassword('short')).toBe(false);
    });

    it('returns false for an empty password', () => {
      expect(isValidPassword('')).toBe(false);
    });
  });

  describe('isValidUserRole', () => {
    it('returns true for manager', () => {
      expect(isValidUserRole('manager')).toBe(true);
    });

    it('returns true for employee', () => {
      expect(isValidUserRole('employee')).toBe(true);
    });

    it('returns false for an invalid role', () => {
      expect(isValidUserRole('admin')).toBe(false);
    });
  });

  describe('isValidOrganizationRoleName', () => {
    it('returns true for a valid organization role name', () => {
      expect(isValidOrganizationRoleName('Shift Lead')).toBe(true);
    });

    it('returns false for an empty role name', () => {
      expect(isValidOrganizationRoleName('')).toBe(false);
    });

    it('returns false for a whitespace-only role name', () => {
      expect(isValidOrganizationRoleName('   ')).toBe(false);
    });
  });
});