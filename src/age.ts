import { z } from 'zod';

/**
 * Date-of-birth contract shared by the API (etao-nextjs) and the mobile app
 * (etao-mobile): the minimum age, the wire format and the pure calendar
 * arithmetic both sides use so they never disagree about who is 18.
 */

/** Minimum age to hold an Etao Assets account. Shared by the API gate and the mobile date picker. */
export const MIN_AGE_YEARS = 18;

/** Calendar date in YYYY-MM-DD form (no time, no zone). */
export const DOB_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Earliest accepted date of birth; anything earlier is a typo. */
export const MIN_DOB_ISO = '1900-01-01';

/** Message returned with errorCodes.UNDERAGE and shown by the app. */
export const UNDERAGE_MESSAGE = 'You must be 18 years or older to use Etao Assets.';

/** True when `iso` is YYYY-MM-DD and names a real calendar day (rejects 2000-02-30). */
export function isValidCalendarDate(iso: string): boolean {
  if (!DOB_REGEX.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}

/**
 * True when a person born on `dobIso` has completed `years` full years on
 * `todayIso`. Pure arithmetic on the YYYY-MM-DD parts: no Date objects, no
 * time zones. A birthday today counts. A 29 Feb birthday completes the year
 * on 1 Mar in a non-leap year.
 */
export function isAtLeastAge(dobIso: string, years: number, todayIso: string): boolean {
  const [dy, dm, dd] = dobIso.split('-').map(Number);
  const [ty, tm, td] = todayIso.split('-').map(Number);
  const diff = ty - dy;
  if (diff !== years) return diff > years;
  if (tm !== dm) return tm > dm;
  return td >= dd;
}

/**
 * Latest date of birth that still satisfies `years` on `todayIso` (today
 * minus `years` years) as YYYY-MM-DD. Use it as the date picker's
 * `maximumDate` on mobile. 29 Feb today maps to 28 Feb when the target
 * year has no 29 Feb.
 */
export function latestDobForAge(years: number, todayIso: string): string {
  const [ty, tm, td] = todayIso.split('-').map(Number);
  const y = ty - years;
  const daysInMonth = new Date(Date.UTC(y, tm, 0)).getUTCDate();
  const d = Math.min(td, daysInMonth);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${y}-${pad(tm)}-${pad(d)}`;
}

/** Device-local calendar date as YYYY-MM-DD without Intl (Hermes-safe). */
export function localTodayIso(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Required DOB for client forms: format, real date, >= 1900, and 18+ on the device date. */
export const dobSchema = z
  .string()
  .regex(DOB_REGEX, 'Date of birth must be in YYYY-MM-DD format')
  .refine(value => isValidCalendarDate(value), 'Enter a valid date of birth')
  .refine(value => value >= MIN_DOB_ISO, 'Enter a valid date of birth')
  .refine(value => isAtLeastAge(value, MIN_AGE_YEARS, localTodayIso()), UNDERAGE_MESSAGE);
