// Date helpers. All keys are derived from local time so a "day" matches the
// user's wall clock, not UTC.

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function monthName(month0: number): string {
  return MONTHS[month0];
}

export function weekdayShort(i: number): string {
  return WEEKDAYS_SHORT[i];
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local ISO date key: YYYY-MM-DD. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Month key: YYYY-MM. */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

/** Parse a YYYY-MM-DD key back into a local Date (midnight). */
export function parseDayKey(key: string): Date {
  const [y, m, day] = key.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function isSameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

/** Monday of the week containing `d` (weeks start Monday). */
export function startOfWeek(d: Date): Date {
  const r = new Date(d);
  const day = (r.getDay() + 6) % 7; // 0 = Monday
  r.setDate(r.getDate() - day);
  r.setHours(0, 0, 0, 0);
  return r;
}

/** The 7 dates Mon..Sun for the week containing `d`. */
export function weekDates(d: Date): Date[] {
  const start = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * ISO-8601 week key: YYYY-Www. The year is the ISO week-year, which can
 * differ from the calendar year in late December / early January.
 */
export function weekKey(d: Date): string {
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  // Thursday of this week decides the ISO week-year.
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDayNr = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);
  const week =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${target.getFullYear()}-W${pad2(week)}`;
}

/** Long human label for a day, e.g. "Mon, 18 Jun 2026". */
export function dayLabel(d: Date): string {
  return `${WEEKDAYS_SHORT[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTHS[
    d.getMonth()
  ].slice(0, 3)} ${d.getFullYear()}`;
}

/**
 * A 6×7 grid of dates covering the month of `d`, padded with leading/trailing
 * days from adjacent months (weeks start Monday). Always 42 cells.
 */
export function monthGrid(d: Date): Date[] {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
