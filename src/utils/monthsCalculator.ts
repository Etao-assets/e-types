/**
 * Calculates the number of months between two dates.
 */

interface MonthsCalculatorParams {
  startDate?: Date;
  endDate: Date;
}

/**
 * Calculates the number of months between a start date and an end date.
 * @param params.startDate - The start date (defaults to current date if not provided)
 * @param params.endDate - The end date (required)
 * @returns The number of months between the two dates (can be negative if endDate is before startDate)
 */
export function calculateMonths({ startDate = new Date(), endDate }: MonthsCalculatorParams): number {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

export interface MonthsDuration {
  years: number | null;
  yearsLabel: string | null;
  months: number | null;
  monthsLabel: string | null;
  isNegative: boolean;
}

/**
 * Formats a number of months into an object with discrete parts for flexible styling.
 * Shows full years and remaining months; months-only if less than 12.
 * @param totalMonths - The number of months to format
 * @returns An object with `years`, `yearsLabel`, `months`, `monthsLabel`, and `isNegative`
 * @example
 * // 14 months → { years: 1, yearsLabel: "year", months: 2, monthsLabel: "months", isNegative: false }
 * // 5 months  → { years: null, yearsLabel: null, months: 5, monthsLabel: "months", isNegative: false }
 * // 24 months → { years: 2, yearsLabel: "years", months: null, monthsLabel: null, isNegative: false }
 */
export function formatMonthsDuration(totalMonths: number): MonthsDuration {
  const absMonths = Math.abs(totalMonths);
  const years = Math.floor(absMonths / 12);
  const months = absMonths % 12;

  return {
    years: years > 0 ? years : null,
    yearsLabel: years > 0 ? (years === 1 ? 'year' : 'years') : null,
    months: months > 0 ? months : null,
    monthsLabel: months > 0 ? (months === 1 ? 'month' : 'months') : null,
    isNegative: totalMonths < 0,
  };
}
