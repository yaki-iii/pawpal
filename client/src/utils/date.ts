import { format, formatDistanceToNow, differenceInDays, differenceInYears, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * Format a date string to "yyyy-MM-dd" format.
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd', { locale: zhCN });
}

/**
 * Format a date string to "yyyy-MM-dd HH:mm" format.
 */
export function formatDateTime(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm', { locale: zhCN });
}

/**
 * Format a date to relative time (e.g., "3小时前", "2天前").
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
}

/**
 * Calculate age in years from birthday.
 */
export function calculateAge(birthday: string | Date | null): string {
  if (!birthday) return '未知';
  const d = typeof birthday === 'string' ? parseISO(birthday) : birthday;
  const years = differenceInYears(new Date(), d);
  if (years === 0) {
    const days = differenceInDays(new Date(), d);
    if (days < 30) return `${days}天`;
    return `${Math.floor(days / 30)}个月`;
  }
  return `${years}岁`;
}

/**
 * Calculate days until a target date.
 * Returns negative for past dates.
 */
export function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(d, new Date());
}

/**
 * Get reminder urgency level based on days until due.
 */
export function getReminderUrgency(nextDate: string | Date): 'overdue' | 'urgent' | 'soon' | 'future' {
  const days = daysUntil(nextDate);
  if (days < 0) return 'overdue';
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'soon';
  return 'future';
}

/**
 * Get urgency color based on days until due.
 */
export function getUrgencyColor(nextDate: string | Date): string {
  const urgency = getReminderUrgency(nextDate);
  const colors: Record<string, string> = {
    overdue: '#E53935',
    urgent: '#FF9800',
    soon: '#FFC107',
    future: '#4CAF50',
  };
  return colors[urgency];
}

/**
 * Get urgency label in Chinese.
 */
export function getUrgencyLabel(nextDate: string | Date): string {
  const days = daysUntil(nextDate);
  if (days < 0) return `已过期${Math.abs(days)}天`;
  if (days === 0) return '今天到期';
  if (days <= 3) return `${days}天后到期`;
  if (days <= 7) return `${days}天后到期`;
  return `${days}天后到期`;
}

/**
 * Calculate next date given a last date and cycle in days.
 */
export function calculateNextDate(lastDate: string | Date, cycleDays: number): Date {
  const d = typeof lastDate === 'string' ? parseISO(lastDate) : lastDate;
  const next = new Date(d);
  next.setDate(next.getDate() + cycleDays);
  return next;
}
