// Generates concrete custody day-dates from a repeating pattern, so a parent can
// say "I have them every Tue/Thu" or "the first two weekends each month" once and
// have the calendar filled in for the months ahead.

export type CustodyPattern =
  | { kind: 'weekdays'; weekdays: number[] } // 0=Sun … 6=Sat, repeats every week
  | { kind: 'nth_weekends'; ordinals: number[]; includeFriday?: boolean } // 1..4 or 5 ("last")
  | { kind: 'alternating_weekends'; anchorSaturday: string; includeFriday?: boolean };

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function iso(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** All Saturdays in a given month (year, month0). */
function saturdaysIn(year: number, month0: number): Date[] {
  const result: Date[] = [];
  const d = new Date(year, month0, 1);
  while (d.getMonth() === month0) {
    if (d.getDay() === 6) result.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return result;
}

function weekendDays(saturday: Date, includeFriday?: boolean): Date[] {
  const days = [saturday, addDays(saturday, 1)]; // Sat, Sun
  if (includeFriday) days.unshift(addDays(saturday, -1)); // Fri
  return days;
}

/**
 * Returns sorted, de-duplicated 'YYYY-MM-DD' dates the pattern produces between
 * `fromISO` (inclusive) and `months` months later.
 */
export function generateCustodyDates(pattern: CustodyPattern, fromISO: string, months = 3): string[] {
  const [fy, fm, fd] = fromISO.split('-').map(Number);
  const start = new Date(fy, (fm || 1) - 1, fd || 1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);

  const out = new Set<string>();
  const within = (d: Date) => d >= start && d <= end;

  if (pattern.kind === 'weekdays') {
    const d = new Date(start);
    while (d <= end) {
      if (pattern.weekdays.includes(d.getDay())) out.add(iso(d));
      d.setDate(d.getDate() + 1);
    }
  } else if (pattern.kind === 'nth_weekends') {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const sats = saturdaysIn(cursor.getFullYear(), cursor.getMonth());
      for (const ord of pattern.ordinals) {
        const sat = ord >= 5 ? sats[sats.length - 1] : sats[ord - 1];
        if (sat) weekendDays(sat, pattern.includeFriday).forEach(day => { if (within(day)) out.add(iso(day)); });
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else if (pattern.kind === 'alternating_weekends') {
    const [ay, am, ad] = pattern.anchorSaturday.split('-').map(Number);
    let sat = new Date(ay, (am || 1) - 1, ad || 1);
    // Walk back to before the range, then forward every 14 days.
    while (sat > start) sat = addDays(sat, -14);
    while (sat <= end) {
      weekendDays(sat, pattern.includeFriday).forEach(day => { if (within(day)) out.add(iso(day)); });
      sat = addDays(sat, 14);
    }
  }

  return Array.from(out).sort();
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
