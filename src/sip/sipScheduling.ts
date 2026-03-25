/**
 * FOT + SIP Scheduling Logic
 *
 * Determines the first SIP installment date based on the user's preferred
 * day of month, ensuring:
 * - Minimum 30-day gap between today (FOT) and first SIP
 * - SIP aligns with user-selected day of month
 * - SIP never scheduled in the same month as FOT
 * - If selected day doesn't exist in a month (e.g., 31 in Feb), adjusted to last valid day
 * - Deterministic output for same inputs
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SipSchedulingResult {
  /** The computed first SIP installment date */
  firstSipDate: Date;
}

export interface SipSchedulingInput {
  /** The user's preferred day of month for SIP (1–31) */
  sipDayOfMonth: number;
  /** Reference "today" date (defaults to current date). Useful for testing. */
  today?: Date;
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// ─── Public Functions ────────────────────────────────────────────────────────

/**
 * Core scheduling function.
 *
 * @deprecated Use calculateSipScheduleWithFot instead
 */
export function calculateSipSchedule(
  input: SipSchedulingInput,
): SipSchedulingResult {
  // Construct as UTC midnight so getUTCDate() returns the correct day
  const sipDate = new Date(Date.UTC(2000, 0, input.sipDayOfMonth));
  return calculateSipScheduleWithFot(sipDate, input.today);
}

/**
 * FOT + SIP scheduling function.
 *
 * Accepts the user's preferred SIP date (only the day-of-month is used)
 * and internally uses today as the FOT date. Returns the earliest valid
 * first SIP date satisfying the 30-day gap rule.
 *
 * @param sipDate - A Date whose day-of-month is the user's preferred SIP day (1–31)
 * @param today   - Optional reference date for testing (defaults to current date)
 * @returns Deterministic result containing firstSipDate and skipped cycle metadata.
 */
export function calculateSipScheduleWithFot(
  sipDate: Date,
  today: Date = new Date(),
): SipSchedulingResult {
  // Use getUTCDate() - ISO date strings are parsed as UTC midnight
  const sipDayOfMonth = sipDate.getUTCDate();

  if (sipDayOfMonth < 1 || sipDayOfMonth > 31) {
    throw new Error('sipDayOfMonth must be between 1 and 31');
  }

  // Normalize to UTC midnight so toISOString() always shows the correct date
  const fotDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const minSipDate = new Date(fotDate);
  minSipDate.setUTCDate(minSipDate.getUTCDate() + 30);

  // Start searching from the month AFTER FOT
  let candidateYear = fotDate.getUTCFullYear();
  let candidateMonth = fotDate.getUTCMonth() + 1;
  if (candidateMonth > 11) {
    candidateMonth = 0;
    candidateYear++;
  }

  let firstSipDate: Date | null = null;

  for (let i = 0; i < 24; i++) {
    const maxDay = lastDayOfMonth(candidateYear, candidateMonth);
    const actualDay = Math.min(sipDayOfMonth, maxDay);
    // Construct in UTC so serialization always returns the intended date
    const candidateDate = new Date(Date.UTC(candidateYear, candidateMonth, actualDay));

    if (candidateDate.getTime() < minSipDate.getTime()) {
      candidateMonth++;
      if (candidateMonth > 11) {
        candidateMonth = 0;
        candidateYear++;
      }
      continue;
    }

    firstSipDate = candidateDate;
    break;
  }

  if (!firstSipDate) {
    throw new Error('Unable to determine a valid SIP date within 24 months.');
  }

  return { firstSipDate };
}
