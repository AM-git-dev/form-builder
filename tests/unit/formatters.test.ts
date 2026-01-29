import { describe, it, expect } from 'vitest';
import {
  formatPercentage,
  formatNumber,
  formatDate,
  formatDateTime,
} from '../../src/client/utils/formatters.js';

describe('formatPercentage', () => {
  it('should format an integer percentage with one decimal', () => {
    expect(formatPercentage(50)).toBe('50.0%');
  });

  it('should format zero percent', () => {
    expect(formatPercentage(0)).toBe('0.0%');
  });

  it('should format 100 percent', () => {
    expect(formatPercentage(100)).toBe('100.0%');
  });

  it('should format a decimal percentage with one decimal place', () => {
    expect(formatPercentage(33.33)).toBe('33.3%');
  });

  it('should round decimal values to one decimal place', () => {
    expect(formatPercentage(66.67)).toBe('66.7%');
  });
});

describe('formatNumber', () => {
  it('should format large numbers with French locale separator', () => {
    const result = formatNumber(1000);
    // French locale uses a non-breaking space (U+202F or U+00A0) as thousands separator
    expect(result).toMatch(/1\s?000/);
  });

  it('should format zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should format negative numbers', () => {
    const result = formatNumber(-5000);
    expect(result).toMatch(/-5\s?000/);
  });

  it('should format very large numbers', () => {
    const result = formatNumber(1234567);
    expect(result).toMatch(/1\s?234\s?567/);
  });
});

describe('formatDate', () => {
  it('should format a Date object to French format dd/mm/yyyy', () => {
    const result = formatDate(new Date(2025, 0, 15)); // Jan 15, 2025
    expect(result).toBe('15/01/2025');
  });

  it('should format an ISO date string', () => {
    const result = formatDate('2025-06-30T12:00:00Z');
    expect(result).toMatch(/30\/06\/2025/);
  });
});

describe('formatDateTime', () => {
  it('should format a date with time in French format', () => {
    const result = formatDateTime(new Date(2025, 0, 15, 14, 30));
    expect(result).toContain('15/01/2025');
    expect(result).toContain('14:30');
  });
});
