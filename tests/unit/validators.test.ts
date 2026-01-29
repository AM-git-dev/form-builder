import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPhone, isNotEmpty } from '../../src/client/utils/validators.js';

describe('isValidEmail', () => {
  it('should accept valid standard email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('should accept email with dots in local part', () => {
    expect(isValidEmail('user.name@domain.co')).toBe(true);
  });

  it('should accept email with plus tag', () => {
    expect(isValidEmail('user+tag@domain.com')).toBe(true);
  });

  it('should reject empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('should reject string without @ symbol', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  it('should reject email without local part', () => {
    expect(isValidEmail('@domain.com')).toBe(false);
  });

  it('should reject email without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('should reject email with spaces in local part', () => {
    expect(isValidEmail('user @domain.com')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('should accept international format with country code', () => {
    expect(isValidPhone('+33612345678')).toBe(true);
  });

  it('should accept phone with spaces', () => {
    expect(isValidPhone('06 12 34 56 78')).toBe(true);
  });

  it('should accept US format with parentheses and dashes', () => {
    expect(isValidPhone('+1 (555) 123-4567')).toBe(true);
  });

  it('should accept local format without country code', () => {
    expect(isValidPhone('0612345678')).toBe(true);
  });

  it('should reject empty string', () => {
    expect(isValidPhone('')).toBe(false);
  });

  it('should reject alphabetic string', () => {
    expect(isValidPhone('abc')).toBe(false);
  });

  it('should reject number too short (fewer than 7 digits)', () => {
    expect(isValidPhone('123')).toBe(false);
  });
});

describe('isNotEmpty', () => {
  it('should return true for non-empty string', () => {
    expect(isNotEmpty('hello')).toBe(true);
  });

  it('should return true for non-empty array', () => {
    expect(isNotEmpty([1, 2])).toBe(true);
  });

  it('should return true for zero (number)', () => {
    expect(isNotEmpty(0)).toBe(true);
  });

  it('should return true for boolean false', () => {
    expect(isNotEmpty(false)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isNotEmpty(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isNotEmpty(undefined)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isNotEmpty('')).toBe(false);
  });

  it('should return false for whitespace-only string', () => {
    expect(isNotEmpty('   ')).toBe(false);
  });

  it('should return false for empty array', () => {
    expect(isNotEmpty([])).toBe(false);
  });
});
