import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  calculateAge,
  daysUntil,
  getReminderUrgency,
  getUrgencyColor,
  getUrgencyLabel,
  calculateNextDate,
} from '../utils/date';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format ISO date string to yyyy-MM-dd', () => {
      expect(formatDate('2026-06-15T10:30:00.000Z')).toBe('2026-06-15');
    });

    it('should return empty string for null', () => {
      expect(formatDate(null)).toBe('');
    });

    it('should handle Date object', () => {
      const date = new Date('2026-06-15T00:00:00.000Z');
      // Timezone may affect the display, but the date should be close
      const result = formatDate(date);
      expect(result).toMatch(/^2026-06-1[45]$/);
    });
  });

  describe('formatDateTime', () => {
    it('should format to yyyy-MM-dd HH:mm', () => {
      const result = formatDateTime('2026-06-15T10:30:00.000Z');
      expect(result).toMatch(/^2026-06-1[45] \d{2}:\d{2}$/);
    });

    it('should return empty string for null', () => {
      expect(formatDateTime(null)).toBe('');
    });
  });

  describe('calculateAge', () => {
    it('should return "未知" for null birthday', () => {
      expect(calculateAge(null)).toBe('未知');
    });

    it('should calculate age in years', () => {
      const birthday = new Date();
      birthday.setFullYear(birthday.getFullYear() - 3);
      const result = calculateAge(birthday.toISOString());
      expect(result).toBe('3岁');
    });

    it('should return months for age < 1 year', () => {
      const birthday = new Date();
      birthday.setMonth(birthday.getMonth() - 2);
      const result = calculateAge(birthday.toISOString());
      expect(result).toMatch(/个月/);
    });

    it('should return days for age < 30 days', () => {
      const birthday = new Date();
      birthday.setDate(birthday.getDate() - 15);
      const result = calculateAge(birthday.toISOString());
      expect(result).toMatch(/天/);
    });
  });

  describe('daysUntil', () => {
    it('should return positive days for future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const result = daysUntil(future.toISOString());
      expect(result).toBe(10);
    });

    it('should return negative days for past date', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      const result = daysUntil(past.toISOString());
      expect(result).toBe(-5);
    });

    it('should return 0 for today', () => {
      const result = daysUntil(new Date().toISOString());
      expect(result).toBe(0);
    });
  });

  describe('getReminderUrgency', () => {
    it('should return "overdue" for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(getReminderUrgency(past.toISOString())).toBe('overdue');
    });

    it('should return "urgent" for dates within 3 days', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 2);
      expect(getReminderUrgency(soon.toISOString())).toBe('urgent');
    });

    it('should return "soon" for dates within 7 days', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 5);
      expect(getReminderUrgency(soon.toISOString())).toBe('soon');
    });

    it('should return "future" for dates beyond 7 days', () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      expect(getReminderUrgency(future.toISOString())).toBe('future');
    });
  });

  describe('getUrgencyColor', () => {
    it('should return red for overdue', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(getUrgencyColor(past.toISOString())).toBe('#E53935');
    });

    it('should return orange for urgent', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 2);
      expect(getUrgencyColor(soon.toISOString())).toBe('#FF9800');
    });

    it('should return yellow for soon', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 5);
      expect(getUrgencyColor(soon.toISOString())).toBe('#FFC107');
    });

    it('should return green for future', () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      expect(getUrgencyColor(future.toISOString())).toBe('#4CAF50');
    });
  });

  describe('getUrgencyLabel', () => {
    it('should show "已过期" for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      expect(getUrgencyLabel(past.toISOString())).toContain('已过期');
    });

    it('should show "今天到期" for today', () => {
      expect(getUrgencyLabel(new Date().toISOString())).toBe('今天到期');
    });

    it('should show "天后到期" for future dates', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const label = getUrgencyLabel(future.toISOString());
      expect(label).toContain('天后到期');
      expect(label).toContain('10');
    });
  });

  describe('calculateNextDate', () => {
    it('should add cycle days to date', () => {
      const result = calculateNextDate('2026-06-01T00:00:00.000Z', 30);
      const resultDate = new Date(result);
      expect(resultDate.getMonth()).toBe(6); // July (0-indexed, June=5+1=6)
      expect(resultDate.getDate()).toBe(1);
    });

    it('should handle 365-day cycle', () => {
      const result = calculateNextDate('2026-06-01T00:00:00.000Z', 365);
      const resultDate = new Date(result);
      expect(resultDate.getFullYear()).toBe(2027);
    });

    it('should handle Date object input', () => {
      const input = new Date('2026-01-15T00:00:00.000Z');
      const result = calculateNextDate(input, 30);
      expect(result).toBeInstanceOf(Date);
    });
  });
});
