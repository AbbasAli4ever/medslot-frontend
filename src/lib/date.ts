/**
 * Small date helpers that work in the browser's local time zone.
 * We never use `toISOString()` for calendar dates: it converts to UTC and can
 * shift the day by one.
 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> "YYYY-MM-DD" using local time. */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" -> local Date at midnight. */
export function parseISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export const isSunday = (date: Date) => date.getDay() === 0;

/** The clinic is open Monday to Saturday and never takes bookings in the past. */
export function isBookableDay(date: Date, today: Date = startOfToday()): boolean {
  return !isSunday(date) && date >= today;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

/**
 * Calendar grid for a month, Monday first. Returns weeks of 7 cells;
 * cells outside the month are `null`.
 */
export function monthGrid(month: Date): (Date | null)[][] {
  const first = startOfMonth(month);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7; // Monday = 0

  const cells: (Date | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** "2026-11-10" -> "Tue, 10 Nov 2026" */
export function formatDate(value: string): string {
  return parseISODate(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "2026-11-10" -> "Tuesday, 10 November" */
export function formatLongDate(value: string): string {
  return parseISODate(value).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Date -> "November 2026" */
export function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** "2026-11-10" -> "Tue, 10 Nov" */
export function formatShortDate(value: string): string {
  return parseISODate(value).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** "Today", "Tomorrow" or "Tue, 10 Nov" — for list section headers. */
export function relativeDayLabel(value: string, today: Date = startOfToday()): string {
  const day = parseISODate(value);
  const diffDays = Math.round((day.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return formatShortDate(value);
}

/** The next `count` calendar days starting today. */
export function nextDays(count: number, from: Date = startOfToday()): Date[] {
  return Array.from(
    { length: count },
    (_, i) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + i),
  );
}

/** First day from today that the clinic is open (skips Sunday). */
export function firstBookableDay(today: Date = startOfToday()): Date {
  return nextDays(7, today).find((day) => isBookableDay(day, today)) ?? today;
}

/** ("10:30", 45) -> "11:15" */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

/** ISO timestamp -> "7 Nov 2026, 13:18" in local time. */
export function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** ("2026-11-10", 1) -> "2026-11-11" */
export function addDays(value: string, amount: number): string {
  const day = parseISODate(value);
  return toISODate(new Date(day.getFullYear(), day.getMonth(), day.getDate() + amount));
}

export const todayISO = () => toISODate(startOfToday());
