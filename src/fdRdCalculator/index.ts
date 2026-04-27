/**
 * FD / RD calculator utilities.
 * Covers Fixed Deposit (lump-sum compound interest) and
 * Recurring Deposit (monthly instalment compound interest) calculations.
 * All arithmetic uses decimal.js for precision.
 */

import Decimal from 'decimal.js';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Compounding frequency — number of times interest is compounded per year. */
export enum CompoundingFrequencyEnum {
  YEARLY      = 1,
  HALF_YEARLY = 2,
  QUARTERLY   = 4,
  MONTHLY     = 12,
}

/** Calculator mode — Fixed Deposit or Recurring Deposit. */
export enum FdRdModeEnum {
  FD = 'fd',
  RD = 'rd',
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/** Inputs shared by both FD and RD calculations. */
export interface FdRdParams {
  /** Principal amount (FD) or monthly instalment amount (RD) in ₹ */
  amount: number;
  /** Annual interest rate as a percentage (e.g. 7.5 for 7.5%) */
  annualRate: number;
  /** Tenure in months */
  tenureMonths: number;
  /** Compounding frequency per year (default: quarterly = 4) */
  compoundingFrequency?: CompoundingFrequencyEnum;
  /** Calculator mode — 'fd' or 'rd' (default: 'fd') */
  mode?: FdRdModeEnum;
}

/** Result returned by calculateFdRd. */
export interface FdRdResult {
  /** Total maturity amount (principal + interest) */
  maturityAmount: number;
  /** Total principal invested */
  principal: number;
  /** Total interest earned */
  interest: number;
  /** The resolved input parameters used for the calculation */
  params: Required<FdRdParams>;
}

// ---------------------------------------------------------------------------
// Core calculator
// ---------------------------------------------------------------------------

/**
 * Calculate FD or RD maturity value.
 *
 * **FD formula** (lump-sum compound interest):
 * ```
 * A = P × (1 + r/n)^(n × t)
 * ```
 * where r = annual rate (decimal), n = compounding frequency, t = tenure in years.
 *
 * **RD formula** (generalised for any compounding frequency):
 * Each monthly instalment P deposited at month i earns compound interest for
 * the remaining (tenureMonths − i + 1) months:
 * ```
 * A_i = P × (1 + r/n)^(n × t_i)   where t_i = (tenureMonths − i + 1) / 12
 * Maturity = Σ A_i  for i = 1..tenureMonths
 * ```
 */
export function calculateFdRd({
  amount,
  annualRate,
  tenureMonths,
  compoundingFrequency = CompoundingFrequencyEnum.QUARTERLY,
  mode = FdRdModeEnum.FD,
}: FdRdParams): FdRdResult {
  const P = new Decimal(amount);
  const r = new Decimal(annualRate).div(100);       // annual rate as decimal
  const n = new Decimal(compoundingFrequency);
  const rOverN = r.div(n);                          // r/n
  const base = rOverN.plus(1);                      // (1 + r/n)

  let maturity: Decimal;
  let principal: Decimal;

  if (mode === FdRdModeEnum.RD) {
    // Sum instalments: A_i = P × (1 + r/n)^(n × t_i)
    maturity = new Decimal(0);
    for (let i = 1; i <= tenureMonths; i++) {
      const ti = new Decimal(tenureMonths - i + 1).div(12); // remaining years
      const exponent = n.times(ti);
      maturity = maturity.plus(P.times(base.pow(exponent)));
    }
    principal = P.times(tenureMonths);
  } else {
    // FD: A = P × (1 + r/n)^(n × t)
    const t = new Decimal(tenureMonths).div(12);
    const exponent = n.times(t);
    principal = P;
    maturity = P.times(base.pow(exponent));
  }

  const interest = maturity.minus(principal);

  return {
    maturityAmount: maturity.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    principal:      principal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    interest:       interest.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    params: {
      amount,
      annualRate,
      tenureMonths,
      compoundingFrequency,
      mode,
    },
  };
}

// ---------------------------------------------------------------------------
// Convenience wrappers
// ---------------------------------------------------------------------------

/** Calculate FD maturity with quarterly compounding (default). */
export function calculateFd(
  params: Omit<FdRdParams, 'mode'>,
): FdRdResult {
  return calculateFdRd({ ...params, mode: FdRdModeEnum.FD });
}

/** Calculate RD maturity with quarterly compounding (default). */
export function calculateRd(
  params: Omit<FdRdParams, 'mode'>,
): FdRdResult {
  return calculateFdRd({ ...params, mode: FdRdModeEnum.RD });
}
